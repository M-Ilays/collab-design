const mongoose = require("mongoose");

const threadSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [{ type: String }],
  views: { type: Number, default: 0 },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  files: [{ type: String }], // Store URLs of uploaded files
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["active", "closed"], default: "active" },
});

module.exports = mongoose.model("Thread", threadSchema);
