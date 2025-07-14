import db from "../../db.js";
import { createPresignedPutUrl, createPresignedGetUrl } from "../../lib/awsS3Client.js";

// Create a new builder project
export const createProject = async (req, res) => {
    
    try {
        await db.query('BEGIN');
        
        const {
            builderId,
            projectName,
            developerName,
            reraNumber,
            totalInventory,
            numberOfTenants,
            numberOfSaleFlats,
            numberOfCommercialUnits,
            projectType,
            addressLine1,
            addressLine2,
            landmark,
            ctsNumber,
            pincode,
            state,
            city,
            district,
            wings,
            banks
        } = req.body;

        // Validate required fields
        if (!builderId || !projectName || !developerName || !reraNumber) {
            return res.status(400).json({
                error: "Missing required fields: builderId, projectName, developerName, reraNumber"
            });
        }

        // Insert project
        const projectResult = await db.query(`
            INSERT INTO builder_projects (
                builder_id, project_name, developer_name, rera_number,
                total_inventory, number_of_tenants, number_of_sale_flats,
                number_of_commercial_units, project_type, address_line1,
                address_line2, landmark, cts_number, pincode, state, city, district
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING id
        `, [
            builderId, projectName, developerName, reraNumber,
            totalInventory, numberOfTenants, numberOfSaleFlats,
            numberOfCommercialUnits, projectType, addressLine1,
            addressLine2, landmark, ctsNumber, pincode, state, city, district
        ]);

        const projectId = projectResult.rows[0].id;

        // Insert wings
        if (wings && wings.length > 0) {
            for (const wing of wings) {
                if (wing.wingNumber && wing.numberOfFloors && wing.numberOfFlatsPerFloor) {
                    await db.query(`
                        INSERT INTO project_wings (project_id, wing_number, number_of_floors, number_of_flats_per_floor)
                        VALUES ($1, $2, $3, $4)
                    `, [projectId, wing.wingNumber, wing.numberOfFloors, wing.numberOfFlatsPerFloor]);
                }
            }
        }

        // Insert banks
        if (banks && banks.length > 0) {
            for (const bank of banks) {
                if (bank.bankName && bank.apfNumber) {
                    await db.query(`
                        INSERT INTO project_banks (project_id, bank_name, apf_number)
                        VALUES ($1, $2, $3)
                    `, [projectId, bank.bankName, bank.apfNumber]);
                }
            }
        }

        // Create default APF documents for the project
        await createDefaultAPFDocuments(db, projectId);

        await db.query('COMMIT');

        res.status(201).json({
            success: true,
            message: "Project created successfully",
            projectId: projectId
        });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error("Error creating project:", error);
        
        if (error.code === '23505') { // Unique constraint violation
            return res.status(409).json({
                error: "Project with this RERA number already exists"
            });
        }
        
        res.status(500).json({
            error: "Failed to create project",
            details: error.message
        });
    } 
};

// Get all projects for a builder
export const getBuilderProjects = async (req, res) => {
    try {
        const { builderId } = req.params;
        const { search, status } = req.query;

        let query = `
            SELECT 
                bp.*,
                COUNT(DISTINCT pw.id) as total_wings,
                COUNT(DISTINCT pb.id) as total_banks,
                COUNT(DISTINCT pi.id) as total_inventory,
                COUNT(DISTINCT CASE WHEN pi.booking_status = 'sold' THEN pi.id END) as sold_units
            FROM builder_projects bp
            LEFT JOIN project_wings pw ON bp.id = pw.project_id
            LEFT JOIN project_banks pb ON bp.id = pb.project_id
            LEFT JOIN project_inventory pi ON bp.id = pi.project_id
            WHERE bp.builder_id = $1
        `;

        const params = [builderId];
        let paramIndex = 2;

        if (search) {
            query += ` AND (bp.project_name ILIKE $${paramIndex} OR bp.developer_name ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (status && status !== 'all') {
            query += ` AND bp.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        query += `
            GROUP BY bp.id
            ORDER BY bp.created_at DESC
        `;

        const result = await db.query(query, params);

        res.json({
            success: true,
            projects: result.rows
        });

    } catch (error) {
        console.error("Error fetching builder projects:", error);
        res.status(500).json({
            error: "Failed to fetch projects",
            details: error.message
        });
    }
};

// Get project details with wings, banks, and APF documents
export const getProjectDetails = async (req, res) => {
    try {
        const { projectId } = req.params;

        // Get project details
        const projectResult = await db.query(`
            SELECT * FROM builder_projects WHERE id = $1
        `, [projectId]);

        if (projectResult.rows.length === 0) {
            return res.status(404).json({
                error: "Project not found"
            });
        }

        const project = projectResult.rows[0];

        // Get wings
        const wingsResult = await db.query(`
            SELECT * FROM project_wings WHERE project_id = $1 ORDER BY wing_number
        `, [projectId]);

        // Get banks
        const banksResult = await db.query(`
            SELECT * FROM project_banks WHERE project_id = $1 ORDER BY bank_name
        `, [projectId]);

        // Get APF documents
        const documentsResult = await db.query(`
            SELECT * FROM apf_documents WHERE project_id = $1 ORDER BY document_name
        `, [projectId]);

        res.json({
            success: true,
            project: {
                ...project,
                wings: wingsResult.rows,
                banks: banksResult.rows,
                apfDocuments: documentsResult.rows
            }
        });

    } catch (error) {
        console.error("Error fetching project details:", error);
        res.status(500).json({
            error: "Failed to fetch project details",
            details: error.message
        });
    }
};

// Get APF documents for a project
export const getAPFDocuments = async (req, res) => {
    try {
        const { projectId } = req.params;

        const result = await db.query(`
            SELECT * FROM apf_documents 
            WHERE project_id = $1 
            ORDER BY document_name
        `, [projectId]);

        res.json({
            success: true,
            documents: result.rows
        });

    } catch (error) {
        console.error("Error fetching APF documents:", error);
        res.status(500).json({
            error: "Failed to fetch APF documents",
            details: error.message
        });
    }
};

// Update APF document upload status
export const updateAPFDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { 
            filePath, 
            fileName, 
            fileSize, 
            mimeType, 
            uploadStatus = 'uploaded' 
        } = req.body;

        const result = await db.query(`
            UPDATE apf_documents 
            SET 
                file_path = $1,
                file_name = $2,
                file_size = $3,
                mime_type = $4,
                upload_status = $5,
                uploaded_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6
            RETURNING *
        `, [filePath, fileName, fileSize, mimeType, uploadStatus, documentId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Document not found"
            });
        }

        res.json({
            success: true,
            message: "Document updated successfully",
            document: result.rows[0]
        });

    } catch (error) {
        console.error("Error updating APF document:", error);
        res.status(500).json({
            error: "Failed to update document",
            details: error.message
        });
    }
};

// Get project inventory
export const getProjectInventory = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { search, status } = req.query;

        let query = `
            SELECT 
                pi.*,
                pw.wing_number,
                u.name as customer_name
            FROM project_inventory pi
            LEFT JOIN project_wings pw ON pi.wing_id = pw.id
            LEFT JOIN users u ON pi.customer_id = u.id
            WHERE pi.project_id = $1
        `;

        const params = [projectId];
        let paramIndex = 2;

        if (search) {
            query += ` AND (pi.flat_number ILIKE $${paramIndex} OR pi.customer_name ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (status && status !== 'all') {
            query += ` AND pi.booking_status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        query += ` ORDER BY pi.wing, pi.floor, pi.flat_number`;

        const result = await db.query(query, params);

        res.json({
            success: true,
            inventory: result.rows
        });

    } catch (error) {
        console.error("Error fetching project inventory:", error);
        res.status(500).json({
            error: "Failed to fetch inventory",
            details: error.message
        });
    }
};

// Update project inventory
export const updateProjectInventory = async (req, res) => {
    try {
        const { inventoryId } = req.params;
        const { 
            customerId, 
            customerName, 
            bookingStatus, 
            agreementValue 
        } = req.body;

        const result = await db.query(`
            UPDATE project_inventory 
            SET 
                customer_id = $1,
                customer_name = $2,
                booking_status = $3,
                agreement_value = $4,
                booking_date = CASE WHEN $3 IN ('booked', 'sold') THEN CURRENT_TIMESTAMP ELSE booking_date END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
            RETURNING *
        `, [customerId, customerName, bookingStatus, agreementValue, inventoryId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Inventory item not found"
            });
        }

        res.json({
            success: true,
            message: "Inventory updated successfully",
            inventory: result.rows[0]
        });

    } catch (error) {
        console.error("Error updating inventory:", error);
        res.status(500).json({
            error: "Failed to update inventory",
            details: error.message
        });
    }
};

// Helper function to create default APF documents
async function createDefaultAPFDocuments(db, projectId) {
    const defaultDocuments = [
        { name: 'Development Agreement', type: 'development_agreement' },
        { name: 'Irrevocable Power Of Attorney', type: 'power_of_attorney' },
        { name: 'Land Purchase Documents', type: 'land_purchase_documents' },
        { name: 'Conveyance Deed/Chain Documents', type: 'conveyance_deed' },
        { name: 'Draft copy of agreement for sale', type: 'agreement_for_sale' },
        { name: 'NON Agricultural', type: 'non_agricultural' },
        { name: '7/12 Extract', type: 'extract_7_12' },
        { name: 'Property Card', type: 'property_card' },
        { name: 'Index 2 issued by the Sub Registrar', type: 'index_2' },
        { name: 'Title Report', type: 'title_report' },
        { name: 'Search Report- 30 years', type: 'search_report' },
        { name: 'Buildings Plans & Approved Layout', type: 'building_plans' },
        { name: 'Intimation of Disapproval', type: 'intimation_disapproval' },
        { name: 'Commencement Certificate', type: 'commencement_certificate' },
        { name: 'Partnership Deed/M & AOA', type: 'partnership_deed' },
        { name: 'Construction Finance - Sanction letter', type: 'construction_finance' },
        { name: 'Environmental Clearance', type: 'environmental_clearance' },
        { name: 'High rise Permission\'s', type: 'high_rise_permissions' },
        { name: 'Partners Self attested pan card', type: 'partners_pan_card' },
        { name: 'Aadher card', type: 'aadhar_card' },
        { name: 'Company pan card', type: 'company_pan_card' },
        { name: 'Office address proof', type: 'office_address_proof' },
        { name: 'Bank Statement with company name', type: 'bank_statement' },
        { name: 'RERA Certificate', type: 'rera_certificate' },
        { name: 'Flat List', type: 'flat_list' }
    ];

    for (const doc of defaultDocuments) {
        await db.query(`
            INSERT INTO apf_documents (project_id, document_name, document_type, upload_status)
            VALUES ($1, $2, $3, 'pending')
        `, [projectId, doc.name, doc.type]);
    }
}

// Delete project
export const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        const result = await db.query(`
            DELETE FROM builder_projects WHERE id = $1
            RETURNING *
        `, [projectId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Project not found"
            });
        }

        res.json({
            success: true,
            message: "Project deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({
            error: "Failed to delete project",
            details: error.message
        });
    }
};

// Generate presigned URL for document upload
export const generateUploadUrl = async (req, res) => {
    try {
        const { documentId, fileName, contentType } = req.body;

        if (!documentId || !fileName || !contentType) {
            return res.status(400).json({
                error: "Missing required fields: documentId, fileName, contentType"
            });
        }

        // Verify document exists
        const documentResult = await db.query(`
            SELECT * FROM apf_documents WHERE id = $1
        `, [documentId]);

        if (documentResult.rows.length === 0) {
            return res.status(404).json({
                error: "Document not found"
            });
        }

        // Generate S3 key
        const timestamp = Date.now();
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const s3Key = `builder-documents/${documentId}/${timestamp}-${sanitizedFileName}`;

        // Generate presigned URL
        const uploadUrl = await createPresignedPutUrl(s3Key, contentType, 600); // 10 minutes

        res.json({
            success: true,
            uploadUrl,
            s3Key,
            documentId
        });

    } catch (error) {
        console.error("Error generating upload URL:", error);
        res.status(500).json({
            error: "Failed to generate upload URL",
            details: error.message
        });
    }
};

// Confirm document upload and update database
export const confirmDocumentUpload = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { s3Key, fileName, fileSize, mimeType } = req.body;

        if (!s3Key || !fileName) {
            return res.status(400).json({
                error: "Missing required fields: s3Key, fileName"
            });
        }

        // Update document record
        const result = await db.query(`
            UPDATE apf_documents 
            SET 
                file_path = $1,
                file_name = $2,
                file_size = $3,
                mime_type = $4,
                upload_status = 'uploaded',
                uploaded_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
            RETURNING *
        `, [s3Key, fileName, fileSize, mimeType, documentId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Document not found"
            });
        }

        res.json({
            success: true,
            message: "Document uploaded successfully",
            document: result.rows[0]
        });

    } catch (error) {
        console.error("Error confirming document upload:", error);
        res.status(500).json({
            error: "Failed to confirm document upload",
            details: error.message
        });
    }
};

// Generate presigned URL for document download
export const generateDownloadUrl = async (req, res) => {
    try {
        const { documentId } = req.params;

        // Get document details
        const documentResult = await db.query(`
            SELECT * FROM apf_documents WHERE id = $1
        `, [documentId]);

        if (documentResult.rows.length === 0) {
            return res.status(404).json({
                error: "Document not found"
            });
        }

        const document = documentResult.rows[0];

        if (!document.file_path) {
            return res.status(404).json({
                error: "Document file not found"
            });
        }

        // Generate presigned URL for download
        const downloadUrl = await createPresignedGetUrl(document.file_path, 3600); // 1 hour

        res.json({
            success: true,
            downloadUrl,
            fileName: document.file_name,
            fileSize: document.file_size,
            mimeType: document.mime_type
        });

    } catch (error) {
        console.error("Error generating download URL:", error);
        res.status(500).json({
            error: "Failed to generate download URL",
            details: error.message
        });
    }
};

// Update project
export const updateProject = async (req, res) => {

    
    try {
        await db.query('BEGIN');
        
        const { projectId } = req.params;
        const {
            projectName,
            developerName,
            reraNumber,
            totalInventory,
            numberOfTenants,
            numberOfSaleFlats,
            numberOfCommercialUnits,
            projectType,
            addressLine1,
            addressLine2,
            landmark,
            ctsNumber,
            pincode,
            state,
            city,
            district,
            status,
            wings,
            banks
        } = req.body;

        // Update project
        const projectResult = await db.query(`
            UPDATE builder_projects 
            SET 
                project_name = $1,
                developer_name = $2,
                rera_number = $3,
                total_inventory = $4,
                number_of_tenants = $5,
                number_of_sale_flats = $6,
                number_of_commercial_units = $7,
                project_type = $8,
                address_line1 = $9,
                address_line2 = $10,
                landmark = $11,
                cts_number = $12,
                pincode = $13,
                state = $14,
                city = $15,
                district = $16,
                status = $17,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $18
            RETURNING *
        `, [
            projectName, developerName, reraNumber, totalInventory,
            numberOfTenants, numberOfSaleFlats, numberOfCommercialUnits,
            projectType, addressLine1, addressLine2, landmark,
            ctsNumber, pincode, state, city, district, status, projectId
        ]);

        if (projectResult.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({
                error: "Project not found"
            });
        }

        // Update wings if provided
        if (wings) {
            // Delete existing wings
            await db.query('DELETE FROM project_wings WHERE project_id = $1', [projectId]);
            
            // Insert new wings
            for (const wing of wings) {
                if (wing.wingNumber && wing.numberOfFloors && wing.numberOfFlatsPerFloor) {
                    await db.query(`
                        INSERT INTO project_wings (project_id, wing_number, number_of_floors, number_of_flats_per_floor)
                        VALUES ($1, $2, $3, $4)
                    `, [projectId, wing.wingNumber, wing.numberOfFloors, wing.numberOfFlatsPerFloor]);
                }
            }
        }

        // Update banks if provided
        if (banks) {
            // Delete existing banks
            await db.query('DELETE FROM project_banks WHERE project_id = $1', [projectId]);
            
            // Insert new banks
            for (const bank of banks) {
                if (bank.bankName && bank.apfNumber) {
                    await db.query(`
                        INSERT INTO project_banks (project_id, bank_name, apf_number)
                        VALUES ($1, $2, $3)
                    `, [projectId, bank.bankName, bank.apfNumber]);
                }
            }
        }

        await db.query('COMMIT');

        res.json({
            success: true,
            message: "Project updated successfully",
            project: projectResult.rows[0]
        });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error("Error updating project:", error);
        
        if (error.code === '23505') { // Unique constraint violation
            return res.status(409).json({
                error: "Project with this RERA number already exists"
            });
        }
        
        res.status(500).json({
            error: "Failed to update project",
            details: error.message
        });
    }
}; 

// Delete APF document
export const deleteAPFDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const result = await db.query(
      `UPDATE apf_documents
       SET file_path = NULL,
           file_name = NULL,
           file_size = NULL,
           mime_type = NULL,
           upload_status = 'pending',
           uploaded_at = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [documentId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Document not found" });
    }
    res.json({ success: true, message: "Document reset successfully" });
  } catch (error) {
    console.error("Error resetting APF document:", error);
    res.status(500).json({
      error: "Failed to reset document",
      details: error.message,
    });
  }
}; 