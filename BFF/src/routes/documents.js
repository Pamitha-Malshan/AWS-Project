const express = require("express");
const multer = require("multer");
const s3 = require("../services/s3Service");

const router = express.Router();

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "image/png",
  "image/jpeg",
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type '${file.mimetype}' is not allowed`));
    }
  },
});

// GET /documents — list all uploaded documents
router.get("/", async (_req, res) => {
  try {
    const docs = await s3.listDocuments();
    res.json({ success: true, data: docs });
  } catch (err) {
    console.error("listDocuments error:", err);
    res.status(500).json({ success: false, message: "Failed to list documents" });
  }
});

// POST /documents — upload a document
router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file provided" });
  }
  try {
    const doc = await s3.uploadDocument(req.file);
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error("uploadDocument error:", err);
    res.status(500).json({ success: false, message: "Failed to upload document" });
  }
});

// GET /documents/download?key=<s3-key> — get a presigned download URL
router.get("/download", async (req, res) => {
  const key = req.query.key;
  if (!key || !key.startsWith("documents/")) {
    return res.status(400).json({ success: false, message: "Invalid document key" });
  }
  try {
    const url = await s3.getDocumentDownloadUrl(key);
    res.json({ success: true, data: { url } });
  } catch (err) {
    console.error("getDocumentDownloadUrl error:", err);
    res.status(500).json({ success: false, message: "Failed to generate download URL" });
  }
});

// DELETE /documents?key=<s3-key> — delete a document
router.delete("/", async (req, res) => {
  const key = req.query.key;
  if (!key || !key.startsWith("documents/")) {
    return res.status(400).json({ success: false, message: "Invalid document key" });
  }
  try {
    await s3.deleteDocument(key);
    res.json({ success: true, message: "Document deleted" });
  } catch (err) {
    console.error("deleteDocument error:", err);
    res.status(500).json({ success: false, message: "Failed to delete document" });
  }
});

// Multer error handler
router.use((err, _req, res, _next) => {
  if (err.message?.includes("File type")) {
    return res.status(415).json({ success: false, message: err.message });
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ success: false, message: "File exceeds 10 MB limit" });
  }
  res.status(500).json({ success: false, message: err.message });
});

module.exports = router;
