import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { createDirectUpload, completeDirectUpload, getDownloadUrl } from '../services/storage.service.js';

const router = express.Router();

router.post('/upload', authenticate, async (req, res) => {
  try {
    const { name, mimeType, size, checksum } = req.body;

    if (!name || !mimeType || !size) {
      console.error('Missing required fields:', { name, mimeType, size });
      return res.status(400).json({
        error: 'name, mimeType and size are required',
      });
    }
    const upload = await createDirectUpload({
      originalName: name,
      mimeType,
      size,
      checksum,
    });

    res.status(200).json(upload);
  } catch (error) {
    console.error('Create upload error:', error);

    res.status(500).json({
      error: 'Failed to create upload',
    });
  }
});

router.post("/upload/:uploadId/complete", authenticate, async (req, res) => {
  try {
    const { uploadId } = req.params;

    const completed = await completeDirectUpload(uploadId);

    res.status(200).json(completed);
  } catch (error) {
    console.error("Complete upload error:", error);

    res.status(500).json({
      error: "Failed to complete upload",
    });
  }
});

router.get("/:fileId/download-url", authenticate, async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({
        error: "File ID is required",
      });
    }

    const result = await getDownloadUrl(fileId);

    res.status(200).json(result);
  } catch (error) {
    console.error("Get download URL error:", error);

    res.status(500).json({
      error: "Failed to get download URL",
    });
  }
});

export default router;