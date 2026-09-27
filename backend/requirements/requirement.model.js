const mongoose = require("mongoose");
const { Schema } = mongoose;

const requirementSchema = new Schema(
  {
    reqId: { type: String, required: true },
    title: { type: String, required: true },
    actor: { type: [String], required: true },
    assignee: { type: [String], required: true },
    stakeholders: { type: [String], default: [] },
    dependencies: { type: [String], default: [] },
    targetRelease: { type: String, required: true },
    category: {
      type: String,
      enum: ["functional", "non_functional"],
      required: true,
    },
    priority: { type: String, enum: ["high", "medium", "low"], required: true },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "on_hold"],
      required: true,
    },
    comments: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: { type: String, required: true },
        time: { type: String, required: true }, // or Date if you prefer timestamps
        type: {
          type: String,
          enum: ["normal", "highlight"],
          default: "normal",
        },
      },
    ],
    description: { type: String, required: true },
    acceptanceCriteria: { type: String, required: true },
    attachments: [
      {
        filename: { type: String },
        filepath: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const Requirement = mongoose.model("Requirement", requirementSchema);

module.exports = Requirement;
