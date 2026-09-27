const mongoose = require("mongoose");

const diagramSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    data: { type: String },
    comments: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: { type: String, required: true },
        time: { type: String, required: true },
        type: {
          type: String,
          enum: ["normal", "highlight"],
          default: "normal",
        },
      },
    ],
    description: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Diagram = mongoose.model("Diagram", diagramSchema);

module.exports = Diagram;
