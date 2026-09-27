const Project = require("./project.model");
const mongoose = require("mongoose");

const addRequirementToProject = async (projectId, requirementId) => {
  try {
    const project = await Project.findById(projectId);

    if (!project) {
      return { success: false, message: "Project not found" };
    }

    if (project.requirements.includes(requirementId)) {
      return {
        success: false,
        message: "Requirement already added to the project",
      };
    }

    project.requirements.push(requirementId);
    await project.save();
    return { success: true, data: project };
  } catch (error) {
    console.error("Error adding requirement to project:", error);
    return { success: false, message: error.message };
  }
};

const getProjectById = async (projectId) => {
  try {
    const project = await Project.findById(projectId)
      .populate({
        path: "requirements",
        populate: {
          path: "comments.author", // this is correct
          model: "User", // explicitly mention the model
          select: "name email", // select the fields you want
        },
      }) // Populating requirements
      .populate("members", "email name _id profilePicture") // Populating members with specific fields
      .populate("owner", "email name _id profilePicture")
      .populate("diagrams"); // Populating owner with specific fields

    if (!project) {
      return { success: false, message: "Project not found" };
    }

    return { success: true, data: project };
  } catch (error) {
    console.error("Error fetching project details:", error);
    return { success: false, message: error.message };
  }
};

const removeRequirementFromProject = async (projectId, requirementId) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return { success: false, message: "Project not found" };
    }
    project.requirements = project.requirements.filter(
      (reqId) => reqId.toString() !== requirementId
    );
    await project.save();
    return {
      success: true,
      message: "Requirement removed from project successfully",
    };
  } catch (error) {
    console.error("Error removing requirement from project:", error);
    return {
      success: false,
      message:
        "An error occurred while removing the requirement from the project",
    };
  }
};

const addDiagramToProject = async (projectId, diagramId) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return { success: false, message: "Project not found" };
    }

    project.diagrams.push(diagramId);
    await project.save();
    return { success: true, data: project };
  } catch (error) {
    console.error("Error adding diagram to project:", error);
    return { success: false, message: error.message };
  }
};

// Remove Diagram from Project
const removeDiagramFromProject = async (projectId, diagramId) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return { success: false, message: "Project not found" };
    }

    project.diagrams.pull(diagramId);
    await project.save();
    return { success: true, data: project };
  } catch (error) {
    console.error("Error removing diagram from project:", error);
    return { success: false, message: error.message };
  }
};

module.exports = {
  addRequirementToProject,
  getProjectById,
  removeRequirementFromProject,
  addDiagramToProject,
  removeDiagramFromProject,
};
