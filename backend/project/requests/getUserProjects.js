const Project = require("../project.model");
const User = require("../../user/user.model");

const getUserProjects = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch different categories of projects
    const recentProjects = await Project.find({
      $or: [{ owner: userId }, { "members.user": userId }],
      status: "Active",
    })
      .sort({ createdAt: -1 })
      .limit(10);

    const myProjects = await Project.find({ owner: userId, status: "Active" });

    const sharedProjects = await Project.find({
      members: userId, // User is a member
      owner: { $ne: userId }, // User is not the owner
    });

    const completedProjects = await Project.find({
      $or: [{ owner: userId }, { "members.user": userId }],
      status: "Completed",
    });

    const archivedProjects = await Project.find({
      owner: userId, // Only projects where the user is the owner
      status: "Archived",
    });

    // Helper function to map member objects to emails and roles
    const mapMembersToDetails = async (memberIds) => {
      if (!memberIds || memberIds.length === 0) return [];
      const users = await User.find({ _id: { $in: memberIds } }).select(
        "email name profilePicture"
      );
      return users.map((user) => ({
        email: user.email,
        name: user.name || "Unknown",
        profilePicture: user.profilePicture,
      }));
    };

    // Transform the data into the required format
    const formattedData = [
      {
        title: "Recent Projects",
        data: await Promise.all(
          recentProjects.map(async (project) => ({
            projectId: project._id,
            name: project.name,
            description: project.description, // Include project description
            ownerId: project.owner,
            status: project.status,
            projectImage: project.projectImage, // Include project image
            teamMembers: await mapMembersToDetails(project.members),
          }))
        ),
      },
      {
        title: "My Projects",
        data: await Promise.all(
          myProjects.map(async (project) => ({
            projectId: project._id,
            name: project.name,
            description: project.description, // Include project description
            ownerId: project.owner,
            status: project.status,
            projectImage: project.projectImage, // Include project image
            teamMembers: await mapMembersToDetails(project.members),
          }))
        ),
      },
      {
        title: "Shared Projects",
        data: await Promise.all(
          sharedProjects.map(async (project) => ({
            projectId: project._id,
            name: project.name,
            description: project.description, // Include project description
            ownerId: project.owner,
            status: project.status,
            projectImage: project.projectImage, // Include project image
            teamMembers: await mapMembersToDetails(project.members),
          }))
        ),
      },
      {
        title: "Completed Projects",
        data: await Promise.all(
          completedProjects.map(async (project) => ({
            projectId: project._id,
            name: project.name,
            description: project.description, // Include project description
            ownerId: project.owner,
            status: project.status,
            projectImage: project.projectImage, // Include project image
            teamMembers: await mapMembersToDetails(project.members),
          }))
        ),
      },
      {
        title: "Archived Projects",
        data: await Promise.all(
          archivedProjects.map(async (project) => ({
            projectId: project._id,
            name: project.name,
            description: project.description, // Include project description
            ownerId: project.owner,
            status: project.status,
            projectImage: project.projectImage, // Include project image
            teamMembers: await mapMembersToDetails(project.members),
          }))
        ),
      },
    ];

    // Send the formatted response
    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = getUserProjects;
