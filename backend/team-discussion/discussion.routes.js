const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const {
  sendMessage,
  getMessages,
  markAsSeen,
} = require("./discussion.controller");

const router = express.Router();

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "../uploads/discussions/");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Create directory if not exists
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

router.post("/", sendMessage); // Send message
router.get("/:projectId", getMessages); // Get messages for a project
router.put("/seen", markAsSeen); // Mark message as seen

// File Upload Endpoint
router.post("/upload", upload.array("attachments"), (req, res) => {
  const fileUrls = req.files.map(
    (file) =>
      `${req.protocol}://${req.get("host")}/uploads/discussions/${
        file.filename
      }`
  );
  res.json({ fileUrls });
});

module.exports = router;
