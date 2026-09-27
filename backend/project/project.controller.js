const express = require("express");
const router = express.Router();
const jwt = require("../middleware/jwt");
const { createProject, upload } = require("./requests/create");
const getUserProjects = require("./requests/getUserProjects");
const updateStatus = require("./requests/updateStatus");
const { getProjectById } = require("./project.service");
const {
  sendErrorResponse,
  sendSuccessResponse,
} = require("../shared/response.service");
const removeMemberFromProject = require("./requests/removeMember");
const addMember = require("./requests/addMember");
const updateProject = require("./requests/updateProject");
const Invitation = require("./invitation/invitation.model");
const Project = require("./project.model");
const Version = require("./version.model");
const Requirement = require("../requirements/requirement.model");
const Diagram = require("../diagram/diagram.model");

router.put("/update", jwt, upload.single("image"), updateProject);
router.post("/create", jwt, upload.single("projectImage"), createProject);
router.get("/user-projects", jwt, getUserProjects);
router.put("/update-status", jwt, updateStatus);
router.put("/remove-member", jwt, removeMemberFromProject);
router.post("/add-member", jwt, addMember);
// Modify your route handler
router.get("/:projectId", jwt, async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await getProjectById(projectId);
    const pendingInvites = await Invitation.find({
      project: projectId,
      status: "Pending",
    }).select("inviteeEmail inviter createdAt");

    if (!project.success) {
      return sendErrorResponse(res, project.message);
    }

    const responseData = {
      ...project.data.toObject(),
      pendingInvites,
    };

    return sendSuccessResponse(
      res,
      "Project fetched successfully",
      responseData
    );
  } catch (error) {
    console.error("Error fetching project:", error);
    return sendErrorResponse(res, error.message, 500);
  }
});

router.post("/:projectId/saveVersion", jwt, async (req, res) => {
  const { projectId } = req.params;
  const { name, description } = req.body;

  try {
    // Get the project with members, requirements, and diagrams
    const project = await Project.findById(projectId)
      .populate("requirements")
      .populate("diagrams");

    if (!project) return sendErrorResponse(res, "Project not found");

    // Authorization
    const userId = req.user.userId;
    const isOwner = project.owner.toString() === userId;
    const isMember = project.members.some(
      (memberId) => memberId.toString() === userId
    );

    if (!isOwner && !isMember) {
      return sendErrorResponse(res, "Unauthorized access", 403);
    }

    // Clone requirements
    const clonedRequirementDocs = await Promise.all(
      project.requirements.map(async (req) => {
        const obj = req.toObject();
        delete obj._id;
        const newReq = new Requirement(obj);
        await newReq.save();
        return newReq._id;
      })
    );

    // ✅ Clone diagrams
    const clonedDiagramDocs = await Promise.all(
      project.diagrams.map(async (dia) => {
        const obj = dia.toObject();
        delete obj._id;
        delete obj.projectId; // Important: Prevent diagram from linking to the live project
        const newDia = new Diagram(obj);
        await newDia.save();
        return newDia._id;
      })
    );

    // Save version
    const version = new Version({
      project: projectId,
      name,
      description,
      requirements: clonedRequirementDocs,
      diagrams: clonedDiagramDocs,
      createdBy: userId,
    });

    await version.save();
    return sendSuccessResponse(res, "Version saved successfully", version);
  } catch (error) {
    console.error("Error saving version:", error);
    return sendErrorResponse(res, error.message);
  }
});

router.get("/:projectId/versions", jwt, async (req, res) => {
  const { projectId } = req.params;

  try {
    const versions = await Version.find({ project: projectId })
      .populate("diagrams")
      .populate("requirements")
      .populate({
        path: "createdBy",
        select: "name", // Only get the user's name
      })
      .sort({ createdAt: -1 });

    return sendSuccessResponse(res, "Versions fetched", versions);
  } catch (error) {
    console.error("Error fetching versions:", error);
    return sendErrorResponse(res, error.message);
  }
});

router.get("/version/:versionId", jwt, async (req, res) => {
  try {
    const version = await Version.findById(req.params.versionId)
      .populate("diagrams")
      .populate("requirements")
      .populate({
        path: "createdBy",
        select: "name", // Only get the user's name
      });
    if (!version) return sendErrorResponse(res, "Version not found");

    return sendSuccessResponse(res, "Version data fetched", version);
  } catch (error) {
    console.error("Error getting version:", error);
    return sendErrorResponse(res, error.message);
  }
});

router.put("/:projectId/restoreVersion", jwt, async (req, res) => {
  const { projectId } = req.params;
  const { versionId } = req.body;
  const userId = req.user.userId;

  if (!versionId) {
    return sendErrorResponse(res, "Version ID is required", 400);
  }

  try {
    // Get the project and validate user access
    const project = await Project.findById(projectId);
    if (!project) return sendErrorResponse(res, "Project not found");

    const isOwner = project.owner.toString() === userId;
    const isMember = project.members.some(
      (memberId) => memberId.toString() === userId
    );

    if (!isOwner && !isMember) {
      return sendErrorResponse(res, "Unauthorized", 403);
    }

    // Get the version
    const version = await Version.findById(versionId)
      .populate("requirements")
      .populate("diagrams");

    if (!version) return sendErrorResponse(res, "Version not found");

    // Clone requirements from version (to avoid _id conflicts)
    const clonedRequirements = await Promise.all(
      version.requirements.map(async (reqDoc) => {
        const reqObj = reqDoc.toObject();
        delete reqObj._id;
        reqObj.project = project._id; // Ensure correct association
        const newReq = new Requirement(reqObj);
        await newReq.save();
        return newReq._id;
      })
    );

    // Optionally: clean up old requirements (optional, be cautious)
    // await Requirement.deleteMany({ _id: { $in: project.requirements } });

    // Update project
    project.requirements = clonedRequirements;
    project.diagrams = version.diagrams.map((d) => d._id);
    await project.save();

    return sendSuccessResponse(res, "Project restored to selected version");
  } catch (error) {
    console.error("Error restoring version:", error);
    return sendErrorResponse(
      res,
      error.message || "Internal Server Error",
      500
    );
  }
});

router.delete("/cancel-invite/:inviteId", jwt, async (req, res) => {
  try {
    const { inviteId } = req.params;

    // Verify the inviter is the current user or project owner
    const invitation = await Invitation.findById(inviteId);
    if (!invitation) {
      return sendErrorResponse(res, "Invitation not found");
    }

    const project = await Project.findById(invitation.project);
    if (!project) {
      return sendErrorResponse(res, "Project not found");
    }

    if (project.owner.toString() !== req.user.userId) {
      return sendErrorResponse(res, "Unauthorized to cancel this invitation");
    }

    await Invitation.findByIdAndDelete(inviteId);

    return sendSuccessResponse(res, "Invitation cancelled successfully");
  } catch (error) {
    console.error("Error cancelling invitation:", error);
    return sendErrorResponse(res, error.message, 500);
  }
});

module.exports = router;
