const express = require("express");
const router = express.Router();
const jwt = require("../middleware/jwt");
const {
  createDiagram,
  deleteDiagram,
  getAllDiagrams,
  updateDiagram,
  getDiagramById,
  updateDiagramById,
  generateDiagrams,
  getGenerationStatus,
} = require("./diagram.service");
const {
  addDiagramToProject,
  removeDiagramFromProject,
} = require("../project/project.service");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../shared/response.service");
const Project = require("../project/project.model");
const Notification = require("../notification/notification.model");
const User = require("../user/user.model");

router.post("/newDiagram/:projectId", jwt, async (req, res) => {
  const { projectId } = req.params;
  const diagramData = req.body;
  const userId = req.user.userId;

  try {
    const result = await createDiagram({
      ...diagramData,
      createdBy: userId,
      projectId,
    });

    if (result.success) {
      const response = await addDiagramToProject(projectId, result.data._id);
      const user = await User.findById(userId);
      const userName = user.name;

      const project = await Project.findById(projectId);
      const io = req.app.get("io");
      if (project && io) {
        const allRecipients = [
          ...project.members.map((id) => id.toString()),
          project.owner.toString(),
        ];
        const uniqueRecipients = [...new Set(allRecipients)].filter(
          (id) => id !== userId
        );

        for (const memberId of uniqueRecipients) {
          await new Notification({
            recipient: memberId,
            project: projectId,
            type: "diagram_added",
            message: `A ${result.data.name} diagram is added to ${
              project.name
            } by ${userName || "a user"}.`,
          }).save();

          io.to(memberId).emit("newNotification", {
            projectId,
            message: `A ${result.data.name} diagram is added to ${
              project.name
            } by ${userName || "a user"}.`,
            type: "diagram_added",
          });
        }
      }
      return sendSuccessResponse(res, {
        message: "Diagram created successfully",
        diagramId: result.data._id,
      });
    } else {
      return sendErrorResponse(res, result.message);
    }
  } catch (error) {
    console.error("Error creating diagram:", error);
    return sendErrorResponse(res, error.message);
  }
});

router.delete("/:projectId/:diagramId", jwt, async (req, res) => {
  const { projectId, diagramId } = req.params;

  try {
    const removeResponse = await removeDiagramFromProject(projectId, diagramId);
    if (!removeResponse.success) {
      return sendErrorResponse(
        res,
        removeResponse.message || "Failed to remove diagram from project"
      );
    }

    const deleteResponse = await deleteDiagram(diagramId);
    if (deleteResponse.success) {
      return sendSuccessResponse(res, "Diagram deleted successfully");
    } else {
      return sendErrorResponse(
        res,
        deleteResponse.message || "Failed to delete the diagram"
      );
    }
  } catch (error) {
    console.error("Error deleting diagram:", error);
    return sendErrorResponse(
      res,
      "An error occurred while deleting the diagram"
    );
  }
});

router.get("/:projectId", jwt, async (req, res) => {
  const { projectId } = req.params;

  try {
    const diagrams = await getAllDiagrams(projectId);

    if (diagrams.success) {
      return sendSuccessResponse(res, diagrams.data);
    } else {
      return sendErrorResponse(
        res,
        diagrams.message || "Failed to fetch diagrams"
      );
    }
  } catch (error) {
    console.error("Error fetching diagrams:", error);
    return sendErrorResponse(res, "An error occurred while fetching diagrams");
  }
});

router.put("/:diagramId", jwt, async (req, res) => {
  const { diagramId } = req.params;
  const updateData = req.body;

  try {
    const result = await updateDiagram(diagramId, updateData);

    if (result.success) {
      return sendSuccessResponse(res, {
        message: "Diagram updated successfully",
        diagram: result.data,
      });
    } else {
      return sendErrorResponse(res, result.message);
    }
  } catch (error) {
    console.error("Error updating diagram:", error);
    return sendErrorResponse(
      res,
      "An error occurred while updating the diagram"
    );
  }
});

router.get("/get/:diagramId", jwt, async (req, res) => {
  const { diagramId } = req.params;
  try {
    const diagram = await getDiagramById(diagramId);
    if (diagram.success) {
      return sendSuccessResponse(res, diagram.data);
    } else {
      return sendErrorResponse(
        res,
        diagram.message || "Failed to fetch diagram"
      );
    }
  } catch (error) {
    console.error("Error fetching diagram:", error);
    return sendErrorResponse(
      res,
      "An error occurred while fetching the diagram"
    );
  }
});

router.put("/edit/:diagramId", jwt, async (req, res) => {
  const { diagramId } = req.params;
  const { name, description } = req.body;

  if (!name || !description) {
    return sendErrorResponse(res, "Name and description are required", 400);
  }

  try {
    const updated = await updateDiagramById(diagramId, { name, description });

    if (updated.success) {
      return sendSuccessResponse(
        res,
        updated.data,
        "Diagram updated successfully"
      );
    } else {
      return sendErrorResponse(
        res,
        updated.message || "Failed to update diagram"
      );
    }
  } catch (error) {
    console.error("Error updating diagram:", error);
    return sendErrorResponse(
      res,
      "An error occurred while updating the diagram"
    );
  }
});

router.post("/generate/:projectId", jwt, async (req, res) => {
  const { projectId } = req.params;
  const { diagramTypes } = req.body;
  const userId = req.user.userId;

  console.log(diagramTypes);

  if (!Array.isArray(diagramTypes) || diagramTypes.length === 0) {
    return sendErrorResponse(
      res,
      "Please specify at least one diagram type to generate"
    );
  }

  try {
    const result = await generateDiagrams(projectId, diagramTypes, userId);

    if (result.success) {
      return sendSuccessResponse(res, {
        message: "Diagram generation successful",
        success: true,
      });
    } else {
      return sendErrorResponse({
        success: false,
        message: "Diagram generation failed",
      });
    }
  } catch (error) {
    console.error("Error starting diagram generation:", error);
    return sendErrorResponse(
      res,
      "An error occurred while starting diagram generation"
    );
  }
});

router.get("/generation-status/:generationId", jwt, async (req, res) => {
  const { generationId } = req.params;

  try {
    const result = await getGenerationStatus(generationId);

    if (result.success) {
      return sendSuccessResponse(res, {
        status: result.data.status,
      });
    } else {
      return sendErrorResponse(res, result.message);
    }
  } catch (error) {
    console.error("Error checking generation status:", error);
    return sendErrorResponse(
      res,
      "An error occurred while checking generation status"
    );
  }
});

module.exports = router;
