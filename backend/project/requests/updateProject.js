const Project = require("../project.model");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../../shared/response.service");

module.exports = async (req, res) => {
  try {
    const { projectId, name, description } = req.body;
    const updateData = {};

    // Validate required fields
    if (!projectId) {
      return sendErrorResponse(res, "Project ID is required");
    }

    // Add fields to update if they exist in request
    if (name) updateData.name = name;
    if (description) updateData.description = description;

    // Handle image upload if exists
    if (req.file) {
      updateData.projectImage = `/uploads/projects/${req.file.filename}`;
    }

    // Find and update the project
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      updateData,
      { new: true } // Return the updated document
    ).populate("members", "name email");

    if (!updatedProject) {
      return sendErrorResponse(res, "Project not found");
    }

    return sendSuccessResponse(
      res,
      "Project updated successfully",
      updatedProject
    );
  } catch (error) {
    console.error("Error updating project:", error);
    return sendErrorResponse(res, error.message, 500);
  }
};
