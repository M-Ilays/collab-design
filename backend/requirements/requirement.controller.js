const express = require("express");
const router = express.Router();
const jwt = require("../middleware/jwt");
const { createReq, deleteRequirement } = require("./requirement.service");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../shared/response.service");
const {
  addRequirementToProject,
  removeRequirementFromProject,
} = require("../project/project.service");
const multer = require("multer");
const path = require("path");
const Requirement = require("./requirement.model");
const mongoose = require("mongoose");
const Project = require("../project/project.model");
const Notification = require("../notification/notification.model");
const User = require("../user/user.model")

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/requirement/attachments");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

const upload = multer({ storage, fileFilter });

router.post(
  "/:projectId/newReq",
  jwt,
  upload.array("attachments", 10),
  async (req, res) => {
    const { projectId } = req.params;
    const requirementData = req.body;

   
    const attachments = req.files.map((file) => ({
      filename: file.originalname,
      filepath: file.path,
    }));

    requirementData.attachments = attachments; 
    requirementData.comments = [];

    try {
      const result = await createReq(requirementData);
      if (result.success) {
        const response = await addRequirementToProject(
          projectId,
          result.data._id
        );
        const userId = req.user.userId;
        
        
        const user = await User.findById(req.user.userId);
        const userName = user.name;
        const project = await Project.findById(projectId);
        const io = req.app.get("io");
        if (project && io) {
          const allRecipients = [
            ...project.members.map(id => id.toString()),
            project.owner.toString()
          ];
          const uniqueRecipients = [...new Set(allRecipients)].filter(
            id => id !== userId
          );

          for (const memberId of uniqueRecipients) {
            await new Notification({
              recipient: memberId,
              project: projectId,
              type: "requirement_added",
              message: `A ${result.data.title} requirement is added to ${project.name} by ${userName || 'a user'}.`,
            }).save();

            io.to(memberId).emit("newNotification", {
              projectId,
              message: `A ${result.data.title} requirement is added to ${project.name} by ${userName || 'a user'}.`,
              type: "requirement_added"
            });
          }
        }
        
          return sendSuccessResponse(res, "Requirement added successfully");
        } else {
          return sendErrorResponse(res, response.message);
        }
      
    } catch (error) {
      console.error("Error in creating requirement:", error);
      return sendErrorResponse(res, error.message);
    }
  }
);

router.delete("/:projectId/:requirementId", jwt, async (req, res) => {
  const { projectId, requirementId } = req.params;

  try {
    // You can check if the user has permission to modify the project/requirement here
    // Remove the requirement from the project
    const removeRequirementResponse = await removeRequirementFromProject(
      projectId,
      requirementId
    );
    if (!removeRequirementResponse.success) {
      return sendErrorResponse(
        res,
        removeRequirementResponse.message ||
          "Failed to remove requirement from project"
      );
    }

    // Step 2: Delete the requirement itself
    const deleteRequirementResponse = await deleteRequirement(requirementId);
    if (deleteRequirementResponse.success) {
      return sendSuccessResponse(res, "Requirement deleted successfully");
    } else {
      return sendErrorResponse(
        res,
        deleteRequirementResponse.message || "Failed to delete the requirement"
      );
    }
  } catch (error) {
    console.error("Error deleting requirement:", error);
    return sendErrorResponse(
      res,
      "An error occurred while deleting the requirement"
    );
  }
});

// routes/requirementRoutes.js
router.put(
  "/:projectId/requirements/:reqId",
  jwt,
  upload.array("attachments", 10),
  async (req, res) => {
    const { projectId, reqId } = req.params;
    const requirementData = req.body;

    try {
      // Verify the project exists
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      // Verify the requirement exists and belongs to the project
      if (!project.requirements.includes(reqId)) {
        return res.status(404).json({
          success: false,
          message: "Requirement not found in project",
        });
      }

      // Process new attachments
      const newAttachments =
        req.files?.map((file) => ({
          filename: file.originalname,
          filepath: file.path,
        })) || [];

      // Handle existing attachments if provided
      let existingAttachments = [];
      if (requirementData.existingAttachments) {
        try {
          existingAttachments = JSON.parse(requirementData.existingAttachments);
        } catch (e) {
          console.error("Error parsing existing attachments:", e);
          return res.status(400).json({
            success: false,
            message: "Invalid existing attachments format",
          });
        }
      }

      // Combine attachments
      requirementData.attachments = [...existingAttachments, ...newAttachments];

      // Handle comments field - parse if it's a string
      if (typeof requirementData.comments === "string") {
        try {
          requirementData.comments = JSON.parse(requirementData.comments);
        } catch (e) {
          console.error("Error parsing comments:", e);
          return res.status(400).json({
            success: false,
            message: "Invalid comments format",
          });
        }
      }

      // Convert stringified arrays back to arrays
      const arrayFields = [
        "actor",
        "assignee",
        "stakeholders",
        "dependencies",
        "comments",
      ];
      arrayFields.forEach((field) => {
        if (
          requirementData[field] &&
          typeof requirementData[field] === "string"
        ) {
          try {
            requirementData[field] = JSON.parse(requirementData[field]);
          } catch (e) {
            // If not JSON string, assume comma-separated (except for comments)
            if (field !== "comments") {
              requirementData[field] = requirementData[field]
                .split(",")
                .map((item) => item.trim());
            }
          }
        }
      });

      // Update the requirement
      const updatedReq = await Requirement.findByIdAndUpdate(
        reqId,
        { $set: requirementData },
        { new: true, runValidators: true }
      );

      if (!updatedReq) {
        return res.status(404).json({
          success: false,
          message: "Requirement not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Requirement updated successfully",
        data: updatedReq,
      });
    } catch (error) {
      console.error("Error updating requirement:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
);

router.post("/:requirementId/addComment", jwt, async (req, res) => {
  const { requirementId } = req.params;
  const { content, type } = req.body;
  const author = req.user.userId; // Get user ID from JWT middleware
  console.log("requirement id:", requirementId);
  try {
    const requirement = await Requirement.findById(requirementId);
    if (!requirement) {
      return sendErrorResponse(res, "Requirement not found");
    }

    const newComment = {
      author,
      content,
      time: new Date().toISOString(), // Better to use ISO string for consistency
      type: type || "normal",
    };

    requirement.comments.push(newComment);
    await requirement.save();

    // Populate author information before sending back
    const populatedReq = await Requirement.populate(requirement, {
      path: "comments.author",
      select: "name email profilePicture",
    });

    // Find the newly added comment (last one in array)
    const addedComment =
      populatedReq.comments[populatedReq.comments.length - 1];

    return sendSuccessResponse(res, "Comment added successfully", addedComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    return sendErrorResponse(res, error.message);
  }
});

router.put(
  "/:requirementId/resolveComment/:commentId",
  jwt,
  async (req, res) => {
    const { requirementId, commentId } = req.params;

    try {
      // 1. Input validation
      if (!mongoose.Types.ObjectId.isValid(requirementId)) {
        return sendErrorResponse(res, "Invalid requirement ID", 400);
      }
      if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return sendErrorResponse(res, "Invalid comment ID", 400);
      }

      // 2. Find and update with atomic operation
      const updatedRequirement = await Requirement.findOneAndUpdate(
        {
          _id: requirementId,
          "comments._id": commentId,
        },
        {
          $set: {
            "comments.$.type": "highlight",
            "comments.$.resolvedAt": new Date(), // Add resolved timestamp
            "comments.$.resolvedBy": req.user._id, // Track who resolved it
          },
        },
        {
          new: true, // Return the updated document
          runValidators: true, // Run schema validators
        }
      );

      if (!updatedRequirement) {
        return sendErrorResponse(res, "Requirement or comment not found", 404);
      }

      // 3. Find the updated comment
      const updatedComment = updatedRequirement.comments.find(
        (c) => c._id.toString() === commentId
      );

      if (!updatedComment) {
        return sendErrorResponse(res, "Comment not found after update", 404);
      }

      // 4. Populate author info
      const populatedComment = await Requirement.populate(updatedComment, {
        path: "author",
        select: "name email profilePicture",
      });

      return sendSuccessResponse(
        res,
        "Comment resolved successfully",
        populatedComment
      );
    } catch (error) {
      console.error("Error resolving comment:", error);
      return sendErrorResponse(res, "Internal server error", 500);
    }
  }
);

module.exports = router;
