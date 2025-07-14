import db from "../../db.js";
import { createPresignedGetUrl, deleteObject } from "../../lib/awsS3Client.js";

// Helper function to update lead status when documents change
async function updateLeadStatusOnDocumentChange(userId) {
  try {
    // Check if user has a lead
    const leadQuery = `
      SELECT id, status 
      FROM leads 
      WHERE customer_id = $1
    `;
    const leadResult = await db.query(leadQuery, [userId]);
    
    if (leadResult.rows.length === 0) {
      console.log(`No lead found for user ${userId}`);
      return;
    }

    const lead = leadResult.rows[0];
    
    // Determine new status based on completion
    const newStatus = await determineCustomerStatus(userId);
    
    if (newStatus !== lead.status) {
      const updateQuery = `
        UPDATE leads 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `;
      await db.query(updateQuery, [newStatus, lead.id]);
      console.log(`Updated lead ${lead.id} status from ${lead.status} to ${newStatus} for user ${userId}`);
    }
    
  } catch (error) {
    console.error("Error updating lead status on document change:", error);
    // Don't throw error - document operations should still succeed
  }
}

// Helper function to determine customer status based on form and document completion
async function determineCustomerStatus(customerId) {
  try {
    // Check if customer has completed all required forms
    const formsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM personal_details WHERE user_id = $1) as personal_details,
        (SELECT COUNT(*) FROM income_details WHERE user_id = $1) as income_details,
        (SELECT COUNT(*) FROM property_details WHERE user_id = $1) as property_details
    `;
    const formsResult = await db.query(formsQuery, [customerId]);
    const forms = formsResult.rows[0];

    // Check if documents are uploaded
    const documentsQuery = `
      SELECT COUNT(*) as document_count
      FROM documents 
      WHERE user_id = $1
    `;
    const documentsResult = await db.query(documentsQuery, [customerId]);
    const documentCount = parseInt(documentsResult.rows[0].document_count);

    // Determine status based on completion
    const hasAllForms = forms.personal_details > 0 && 
                       forms.income_details > 0 && 
                       forms.property_details > 0;

    if (!hasAllForms) {
      return 'pending'; // Still filling out basic forms
    } else if (documentCount === 0) {
      return 'pending'; // Forms complete but no documents uploaded
    } else if (documentCount < 3) { // Assuming minimum 3 documents required
      return 'pending'; // Some documents uploaded but not all
    } else {
      return 'under_review'; // All forms and documents complete
    }

  } catch (error) {
    console.error("Error determining status for customer", customerId, error);
    return 'pending'; // Default to pending on error
  }
}

export async function saveDocument(req, res) {
  try {
    const { userId, docType, storageKey, fileName, size, mimeType } = req.body;
    console.log(req.body);
    const publicUrl = null;   // S3 bucket is private; URLs are generated on demand
    const { rows } = await db.query(
      `INSERT INTO documents
       (user_id, doc_type, file_name, storage_key, public_url, size_bytes, mime_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [userId, docType, fileName, storageKey, publicUrl, size, mimeType],
    );

    // Update lead status after document upload
    await updateLeadStatusOnDocumentChange(userId);
    
    res.status(201).json({ id: rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).send("Cannot save document metadata");
  }
}

// GET /documents/:userId  – return every doc + 60-min signed URL
export async function listDocuments(req, res) {
  const { userId } = req.params;
  const { rows } = await db.query(
    `SELECT id, doc_type, storage_key, file_name, size_bytes, mime_type
       FROM documents WHERE user_id = $1`,
    [userId],
  );

  const docs = [];
  for (const row of rows) {
    try {
      const signedUrl = await createPresignedGetUrl(row.storage_key, 3600);
      docs.push({ ...row, url: signedUrl });
    } catch (e) {
      console.error("Signed URL error", e);
      continue;
    }
  }
  res.json(docs);
}

// DELETE /documents/:id  – remove object + row
export async function deleteDocument(req, res) {
  const { id } = req.params;

  // fetch storage_key so we can delete the file
  const { rows } = await db.query(
    "DELETE FROM documents WHERE id = $1 RETURNING storage_key",
    [id],
  );
  if (!rows.length) return res.status(404).send("Not found");

  const key = rows[0].storage_key;
  
  // Get userId before deleting for lead status update
  const userQuery = await db.query("SELECT user_id FROM documents WHERE id = $1", [id]);
  const userId = userQuery.rows[0]?.user_id;
  
  try {
    await deleteObject(key);
  } catch (e) {
    console.error("S3 delete error", e);
  }
  
  // Update lead status after document deletion
  if (userId) {
    await updateLeadStatusOnDocumentChange(userId);
  }
  
  res.status(204).end();
}
