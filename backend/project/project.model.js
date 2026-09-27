const mongoose = require("mongoose");

const projectSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Active", "Completed", "Archived"], // Allowed values for status
      default: "Active", // Default value for status
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectImage: { type: String, default: "" },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of user IDs
    requirements: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Requirement" },
    ],
    diagrams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Diagram" }],
    discussions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Discussion" }],
  },
  { timestamps: true }
);

projectSchema.virtual("reqCount").get(function () {
  return this.requirements?.length;
});

projectSchema.virtual("diagramCount").get(function () {
  return this.diagrams?.length;
});

projectSchema.virtual("discussionCount").get(function () {
  return this.discussions?.length;
});

projectSchema.virtual("memberCount").get(function () {
  return this.members?.length;
});

projectSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("Project", projectSchema);
