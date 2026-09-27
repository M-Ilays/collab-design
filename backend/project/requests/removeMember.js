const Project = require("../project.model");

const removeMemberFromProject = async (req, res) => {
  const { projectId, memberId } = req.body;
  const ownerId = req.user.userId;
  console.log("member id is", memberId);
  try {
    // Step 1: Find the project by projectId
    const project = await Project.findById(projectId);

    // Step 2: Check if the project exists and the ownerId matches the project owner
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    if (project.owner.toString() !== ownerId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to remove members from this project",
      });
    }

    // Step 3: Remove the memberId from the members array
    project.members = project.members.filter(
      (member) => member.toString() !== memberId
    );

    // Step 4: Save the updated project
    await project.save();

    // Step 5: Return the updated project
    return res
      .status(200)
      .json({ success: true, message: "Member removed successfully", project });
  } catch (error) {
    console.error("Error removing member from project:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = removeMemberFromProject;
