const Project = require("../project.model");

updateStatus = async (req, res) => {
  try {
    const { projectId, newStatus } = req.body;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.owner.toString() !== req.user.userId.toString()) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this project" });
    }

    project.status = newStatus;
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = updateStatus;
