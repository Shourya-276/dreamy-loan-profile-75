import db from "../../db.js";

export async function saveSubmission(req, res) {
  const { userId, formType, addressProof, docIds } = req.body;
  const client = db;
  try {
    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO document_submissions (user_id, form_type, address_proof)
       VALUES ($1, $2, $3) RETURNING id`,
      [userId, formType, addressProof]
    );
    const submissionId = result.rows[0].id;

    if (Array.isArray(docIds) && docIds.length) {
      await client.query(
        `UPDATE documents SET submission_id = $1 WHERE id = ANY($2)`,
        [submissionId, docIds]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ id: submissionId });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).send("Failed to save submission");
  }
} 