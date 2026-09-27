// models/version.model.js
const mongoose = require("mongoose");

const versionSchema = mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    requirements: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Requirement",
      },
    ],
    diagrams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Diagram",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Version", versionSchema);
