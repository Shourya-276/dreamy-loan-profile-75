import db from "../../db.js";

// Get all banks for selection
export async function getBanks(req, res) {
    try {
        const query = `
            SELECT id, bank_name, bank_code, is_active
            FROM bank_master
            WHERE is_active = true
            ORDER BY bank_name
        `;
        
        const result = await db.query(query);
        
        return res.status(200).json({
            message: "Banks retrieved successfully",
            banks: result.rows
        });
    } catch (error) {
        console.error("Error fetching banks:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Get ROI configurations for a specific bank
export async function getBankROIConfig(req, res) {
    try {
        const { bankId } = req.params;

        // Verify bank exists
        const bankQuery = `
            SELECT id, bank_name, bank_code
            FROM bank_master
            WHERE id = $1 AND is_active = true
        `;
        const bankResult = await db.query(bankQuery, [bankId]);
        
        if (bankResult.rows.length === 0) {
            return res.status(404).json({ error: "Bank not found" });
        }

        // Get ROI configurations
        const configQuery = `
            SELECT 
                id,
                cibil_min_score,
                cibil_max_score,
                loan_amount_min,
                loan_amount_max,
                roi_salaried,
                roi_non_salaried,
                processing_fee,
                notes,
                is_active,
                created_at,
                updated_at
            FROM bank_roi_config
            WHERE bank_id = $1 AND is_active = true
            ORDER BY cibil_min_score, loan_amount_min
        `;
        
        const configResult = await db.query(configQuery, [bankId]);
        
        return res.status(200).json({
            message: "ROI configurations retrieved successfully",
            bank: bankResult.rows[0],
            configurations: configResult.rows
        });
    } catch (error) {
        console.error("Error fetching ROI configurations:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Save/Update ROI configurations for a bank
export async function saveBankROIConfig(req, res) {
    try {
        const { bankId } = req.params;
        const { configurations, userId } = req.body;

        // Verify bank exists
        const bankQuery = `
            SELECT id, bank_name
            FROM bank_master
            WHERE id = $1 AND is_active = true
        `;
        const bankResult = await db.query(bankQuery, [bankId]);
        
        if (bankResult.rows.length === 0) {
            return res.status(404).json({ error: "Bank not found" });
        }

        // Validate configurations array
        if (!Array.isArray(configurations) || configurations.length === 0) {
            return res.status(400).json({ error: "Invalid configurations data" });
        }

        // Validate each configuration
        for (const config of configurations) {
            const { cibilMinValue, cibilMaxValue, minValue, maxValue, roiSalaried, roiNonSalaried } = config;
            
            if (!cibilMinValue || !cibilMaxValue || !minValue || !maxValue || !roiSalaried || !roiNonSalaried) {
                return res.status(400).json({ error: "All required fields must be provided" });
            }

            if (parseInt(cibilMinValue) > parseInt(cibilMaxValue)) {
                return res.status(400).json({ error: "CIBIL min score cannot be greater than max score" });
            }

            if (parseFloat(minValue) > parseFloat(maxValue)) {
                return res.status(400).json({ error: "Loan amount min cannot be greater than max" });
            }
        }

        // Begin transaction
        await db.query("BEGIN");

        try {
            // First, deactivate existing configurations for this bank
            await db.query(
                "UPDATE bank_roi_config SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE bank_id = $1",
                [bankId]
            );

            // Insert new configurations
            for (const config of configurations) {
                const insertQuery = `
                    INSERT INTO bank_roi_config (
                        bank_id, cibil_min_score, cibil_max_score, 
                        loan_amount_min, loan_amount_max,
                        roi_salaried, roi_non_salaried, processing_fee,
                        notes, created_by, updated_by, created_at, updated_at
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 
                        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    )
                `;

                await db.query(insertQuery, [
                    bankId,
                    parseInt(config.cibilMinValue),
                    parseInt(config.cibilMaxValue),
                    parseFloat(config.minValue),
                    parseFloat(config.maxValue),
                    parseFloat(config.roiSalaried),
                    parseFloat(config.roiNonSalaried),
                    config.processingFee ? parseFloat(config.processingFee) : null,
                    config.notes || null,
                    userId,
                    userId
                ]);
            }

            await db.query("COMMIT");

            return res.status(200).json({
                message: "ROI configurations saved successfully",
                bank: bankResult.rows[0],
                configurationsCount: configurations.length
            });

        } catch (error) {
            await db.query("ROLLBACK");
            throw error;
        }

    } catch (error) {
        console.error("Error saving ROI configurations:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Delete a specific ROI configuration
export async function deleteROIConfig(req, res) {
    try {
        const { configId } = req.params;
        const { userId } = req.body;

        // Check if configuration exists
        const checkQuery = `
            SELECT brc.id, bm.bank_name
            FROM bank_roi_config brc
            JOIN bank_master bm ON brc.bank_id = bm.id
            WHERE brc.id = $1 AND brc.is_active = true
        `;
        const checkResult = await db.query(checkQuery, [configId]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: "ROI configuration not found" });
        }

        // Soft delete the configuration
        const deleteQuery = `
            UPDATE bank_roi_config 
            SET is_active = false, updated_by = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
        `;
        
        await db.query(deleteQuery, [userId, configId]);

        return res.status(200).json({
            message: "ROI configuration deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting ROI configuration:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Get applicable ROI for loan calculation
export async function getApplicableROI(req, res) {
    try {
        const { bankCode, cibilScore, loanAmount, employmentType } = req.query;

        if (!bankCode || !cibilScore || !loanAmount || !employmentType) {
            return res.status(400).json({ 
                error: "bankCode, cibilScore, loanAmount, and employmentType are required" 
            });
        }

        const query = `
            SELECT 
                brc.roi_salaried,
                brc.roi_non_salaried,
                brc.processing_fee,
                brc.cibil_min_score,
                brc.cibil_max_score,
                brc.loan_amount_min,
                brc.loan_amount_max,
                bm.bank_name
            FROM bank_roi_config brc
            JOIN bank_master bm ON brc.bank_id = bm.id
            WHERE bm.bank_code = $1 
            AND brc.is_active = true
            AND bm.is_active = true
            AND $2 >= brc.cibil_min_score 
            AND $2 <= brc.cibil_max_score
            AND $3 >= brc.loan_amount_min 
            AND $3 <= brc.loan_amount_max
            ORDER BY brc.cibil_min_score DESC, brc.loan_amount_min DESC
            LIMIT 1
        `;

        const result = await db.query(query, [
            bankCode.toUpperCase(),
            parseInt(cibilScore),
            parseFloat(loanAmount)
        ]);

        if (result.rows.length === 0) {
            // Return default rates if no configuration found
            return res.status(200).json({
                message: "No specific ROI configuration found, using default rates",
                roi: 8.8, // Default rate
                processingFee: null,
                isDefault: true
            });
        }

        const config = result.rows[0];
        const isSalaried = employmentType.toLowerCase() === 'salaried';
        const applicableROI = isSalaried ? config.roi_salaried : config.roi_non_salaried;

        return res.status(200).json({
            message: "Applicable ROI found",
            roi: parseFloat(applicableROI),
            processingFee: config.processing_fee ? parseFloat(config.processing_fee) : null,
            bankName: config.bank_name,
            range: {
                cibilMin: config.cibil_min_score,
                cibilMax: config.cibil_max_score,
                loanAmountMin: config.loan_amount_min,
                loanAmountMax: config.loan_amount_max
            },
            isDefault: false
        });

    } catch (error) {
        console.error("Error getting applicable ROI:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Get all ROI configurations for admin overview
export async function getAllROIConfigurations(req, res) {
    try {
        const { page = 1, limit = 20, bankId = 'all' } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = "brc.is_active = true AND bm.is_active = true";
        let queryParams = [];
        let paramCount = 0;

        if (bankId !== 'all') {
            whereClause += ` AND bm.id = $${++paramCount}`;
            queryParams.push(bankId);
        }

        // Count total configurations
        const countQuery = `
            SELECT COUNT(*) as total
            FROM bank_roi_config brc
            JOIN bank_master bm ON brc.bank_id = bm.id
            WHERE ${whereClause}
        `;

        // Get configurations with pagination
        const configQuery = `
            SELECT 
                brc.id,
                brc.cibil_min_score,
                brc.cibil_max_score,
                brc.loan_amount_min,
                brc.loan_amount_max,
                brc.roi_salaried,
                brc.roi_non_salaried,
                brc.processing_fee,
                brc.notes,
                brc.created_at,
                brc.updated_at,
                bm.id as bank_id,
                bm.bank_name,
                bm.bank_code,
                cu.name as created_by_name,
                uu.name as updated_by_name
            FROM bank_roi_config brc
            JOIN bank_master bm ON brc.bank_id = bm.id
            LEFT JOIN users cu ON brc.created_by = cu.id
            LEFT JOIN users uu ON brc.updated_by = uu.id
            WHERE ${whereClause}
            ORDER BY bm.bank_name, brc.cibil_min_score, brc.loan_amount_min
            LIMIT $${++paramCount} OFFSET $${++paramCount}
        `;

        queryParams.push(limit, offset);

        const [countResult, configResult] = await Promise.all([
            db.query(countQuery, queryParams.slice(0, -2)),
            db.query(configQuery, queryParams)
        ]);

        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            message: "ROI configurations retrieved successfully",
            configurations: configResult.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages
            }
        });

    } catch (error) {
        console.error("Error fetching all ROI configurations:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
} 