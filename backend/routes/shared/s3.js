import express from "express";
import { createPresignedPutUrl } from "../../lib/awsS3Client.js";

const router = express.Router();

// POST /s3/sign-upload  { key, contentType }
router.post("/sign-upload", async (req, res) => {
  const { key, contentType } = req.body;
  if (!key || !contentType) {
    return res.status(400).json({ error: "key and contentType required" });
  }
  try {
    const uploadUrl = await createPresignedPutUrl(key, contentType, 600); // 10-min expiry
    res.json({ uploadUrl });
  } catch (err) {
    console.error("Presign error", err);
    res.status(500).json({ error: "Could not create presigned URL" });
  }
});

export default router; 