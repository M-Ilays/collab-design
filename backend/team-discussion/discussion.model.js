const mongoose = require("mongoose");

const discussionSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, default: "" }, // Optional text
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    attachments: [{ type: String }], // Array of file URLs
    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Discussion", discussionSchema);
