const Requirement = require("./requirement.model");

const validateRequirementData = async (data) => {
  const errors = [];

  // Id should be a non-empty string
  if (typeof data.reqId !== "string" || data.reqId.trim() === "") {
    errors.push("Id is required and must be a non-empty string.");
  }

  //Req id should not be duplicate
  const existingRequirement = await Requirement.findOne({ reqId: data.reqId });
  if (existingRequirement) {
    errors.push("The reqId must be unique. This reqId already exists.");
  }

  // Title should be a non-empty string
  if (typeof data.title !== "string" || data.title.trim() === "") {
    errors.push("Title is required and must be a non-empty string.");
  }

  // Actor should be a non-empty array of strings
  if (
    !Array.isArray(data.actor) ||
    data.actor.length === 0 ||
    !data.actor.every((item) => typeof item === "string")
  ) {
    errors.push("Actor must be a non-empty array of strings.");
  }

  // Assignee should be a non-empty array of strings
  if (
    !Array.isArray(data.assignee) ||
    data.assignee.length === 0 ||
    !data.assignee.every((item) => typeof item === "string")
  ) {
    errors.push("Assignee must be a non-empty array of strings.");
  }

  // Stakeholders should be a non-empty array of strings
  if (
    !Array.isArray(data.stakeholders) ||
    data.stakeholders.length === 0 ||
    !data.stakeholders.every((item) => typeof item === "string")
  ) {
    errors.push("Stakeholders must be a non-empty array of strings.");
  }

  // Dependencies should be an array of strings (optional)
  if (
    data.dependencies &&
    (!Array.isArray(data.dependencies) ||
      !data.dependencies.every((item) => typeof item === "string"))
  ) {
    errors.push("Dependencies must be an array of strings.");
  }

  // Target Release should be a non-empty string
  if (
    typeof data.targetRelease !== "string" ||
    data.targetRelease.trim() === ""
  ) {
    errors.push("Target Release is required and must be a non-empty string.");
  }

  // Category should be either "functional" or "non_functional"
  const validCategories = ["functional", "non_functional"];
  if (!validCategories.includes(data.category)) {
    errors.push('Category must be either "functional" or "non_functional".');
  }

  // Priority should be one of "high", "medium", or "low"
  const validPriorities = ["high", "medium", "low"];
  if (!validPriorities.includes(data.priority)) {
    errors.push('Priority must be one of: "high", "medium", or "low".');
  }

  // Status should be one of "not_started", "in_progress", "completed", or "on_hold"
  const validStatuses = ["not_started", "in_progress", "completed", "on_hold"];
  if (!validStatuses.includes(data.status)) {
    errors.push(
      'Status must be one of: "not_started", "in_progress", "completed", or "on_hold".'
    );
  }

  // Description should be a non-empty string
  if (typeof data.description !== "string" || data.description.trim() === "") {
    errors.push("Description is required and must be a non-empty string.");
  }

  // Acceptance Criteria should be a non-empty string
  if (
    typeof data.acceptanceCriteria !== "string" ||
    data.acceptanceCriteria.trim() === ""
  ) {
    errors.push(
      "Acceptance Criteria is required and must be a non-empty string."
    );
  }

  return errors;
};

const createReq = async (data) => {
  console.log("requirement data received", data);
  try {
    const validationErrors = validateRequirementData(data);
    if (validationErrors.length > 0) {
      return { success: false, message: validationErrors.join(" ") };
    }

    // Parse the fields that are received as strings and need to be arrays
    const actor = Array.isArray(data.actor)
      ? data.actor
      : JSON.parse(data.actor);
    const assignee = Array.isArray(data.assignee)
      ? data.assignee
      : JSON.parse(data.assignee);
    const stakeholders = Array.isArray(data.stakeholders)
      ? data.stakeholders
      : JSON.parse(data.stakeholders);
    const dependencies =
      data.dependencies && Array.isArray(data.dependencies)
        ? data.dependencies
        : JSON.parse(data.dependencies || "[]");

    const processedData = {
      reqId: data.reqId.trim(),
      title: data.title.trim(),
      actor: actor.map((item) => item.trim().toLowerCase()),
      assignee: assignee.map((item) => item.trim().toLowerCase()),
      stakeholders: stakeholders.map((item) => item.trim().toLowerCase()),
      dependencies: dependencies.map((item) => item.trim().toLowerCase()),
      targetRelease: data.targetRelease.trim().toLowerCase(),
      category: data.category.trim().toLowerCase(),
      priority: data.priority.trim().toLowerCase(),
      status: data.status.trim().toLowerCase(),
      description: data.description.trim(),
      acceptanceCriteria: data.acceptanceCriteria.trim(),
      attachments: data.attachments, // Attach file metadata
    };

    const newRequirement = new Requirement(processedData);

    const savedRequirement = await newRequirement.save();
    return { success: true, data: savedRequirement };
  } catch (error) {
    console.error("Error creating requirement:", error);
    return { success: false, message: error.message };
  }
};

const deleteRequirement = async (requirementId) => {
  try {
    const result = await Requirement.findByIdAndDelete(requirementId);
    if (!result) {
      return { success: false, message: "Requirement not found" };
    }
    return { success: true, message: "Requirement deleted successfully" };
  } catch (error) {
    return {
      success: false,
      message: "An error occurred while deleting the requirement",
    };
  }
};
module.exports = { createReq, deleteRequirement };
