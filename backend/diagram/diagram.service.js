const Diagram = require("./diagram.model");
const { v4: uuidv4 } = require("uuid");
const {
  generateUseCaseDiagram,
  generateActivityDiagram,
  generateClassDiagram,
} = require("../services/gemini.service");
const Project = require("../project/project.model");

const createDiagram = async (diagramData) => {
  try {
    const newDiagram = new Diagram(diagramData);
    const savedDiagram = await newDiagram.save();
    return { success: true, data: savedDiagram };
  } catch (error) {
    console.error("Error creating diagram:", error);
    return { success: false, message: error.message };
  }
};

const deleteDiagram = async (diagramId) => {
  try {
    const deletedDiagram = await Diagram.findByIdAndDelete(diagramId);
    if (!deletedDiagram) {
      return { success: false, message: "Diagram not found" };
    }
    return { success: true, data: deletedDiagram };
  } catch (error) {
    console.error("Error deleting diagram:", error);
    return { success: false, message: error.message };
  }
};

const getAllDiagrams = async (projectId) => {
  try {
    const diagrams = await Diagram.find({ projectId: projectId });
    if (!diagrams || diagrams.length === 0) {
      return { success: false, message: "No diagrams found for this project" };
    }
    return { success: true, data: diagrams };
  } catch (error) {
    console.error("Error fetching diagrams:", error);
    return { success: false, message: error.message };
  }
};

const updateDiagram = async (diagramId, updateData) => {
  try {
    const updatedDiagram = await Diagram.findByIdAndUpdate(
      diagramId,
      updateData
    );

    if (!updatedDiagram) {
      return { success: false, message: "Diagram not found" };
    }
    return { success: true, data: updatedDiagram };
  } catch (error) {
    console.error("Error updating diagram:", error);
    return { success: false, message: error.message };
  }
};

async function getDiagramById(diagramId) {
  try {
    const diagram = await Diagram.findById(diagramId);
    if (!diagram) {
      return { success: false, message: "Diagram not found" };
    }
    return { success: true, data: diagram };
  } catch (error) {
    console.error("Error in getDiagramById:", error);
    return { success: false, message: error.message };
  }
}

async function updateDiagramById(diagramId, updateFields) {
  try {
    const diagram = await Diagram.findByIdAndUpdate(
      diagramId,
      { $set: updateFields },
      { new: true }
    );

    if (!diagram) {
      return { success: false, message: "Diagram not found" };
    }

    return { success: true, data: diagram };
  } catch (error) {
    console.error("DB update error:", error);
    return { success: false, message: "Failed to update diagram" };
  }
}

const createUseCaseDiagram = async (projectId, userId) => {
  try {
    const project = await Project.findById(projectId)
      .populate("requirements")
      .exec();
    if (!project) {
      return { success: false, message: "Project not found" };
    }

    const requirementsText = Array.isArray(project.requirements)
    ? project.requirements.map(req =>
        `Title: ${req.title}
  Description: ${req.description}
  Actors: ${Array.isArray(req.actor) ? req.actor.join(', ') : req.actor}
  Assignees: ${Array.isArray(req.assignee) ? req.assignee.join(', ') : req.assignee}
  Stakeholders: ${Array.isArray(req.stakeholders) ? req.stakeholders.join(', ') : req.stakeholders}
  Category: ${req.category}
  Priority: ${req.priority}
  Status: ${req.status}
  Acceptance Criteria: ${req.acceptanceCriteria}
  `
      ).join('\n')
    : String(project.requirements);

    const result = await generateUseCaseDiagram(requirementsText);
    // const result = await generateUseCaseDiagram(project.requirements);
    if (!result.success) {
      return result;
    }
    const diagramDataString = JSON.stringify(result.data);
    const newDiagram = new Diagram({
      name: "Use Case Diagram",
      description: "Automatically generated use case diagram",
      type: "UseCaseDiagram",
      data: diagramDataString,
      projectId,
      createdBy: userId,
    });

    const savedDiagram = await newDiagram.save();
    return { success: true, data: savedDiagram };
  } catch (error) {
    console.error("Error in createUseCaseDiagram:", error);
    return { success: false, message: error.message };
  }
};

const createActivityDiagram = async (projectId, userId) => {
  try {
    const project = await Project.findById(projectId)
      .populate("requirements")
      .exec();
    if (!project) {
      return { success: false, message: "Project not found" };
    }
    const requirementsText = Array.isArray(project.requirements)
    ? project.requirements.map(req =>
        `Title: ${req.title}
  Description: ${req.description}
  Actors: ${Array.isArray(req.actor) ? req.actor.join(', ') : req.actor}
  Assignees: ${Array.isArray(req.assignee) ? req.assignee.join(', ') : req.assignee}
  Stakeholders: ${Array.isArray(req.stakeholders) ? req.stakeholders.join(', ') : req.stakeholders}
  Category: ${req.category}
  Priority: ${req.priority}
  Status: ${req.status}
  Acceptance Criteria: ${req.acceptanceCriteria}
  `
      ).join('\n')
    : String(project.requirements);

  const result = await generateUseCaseDiagram(requirementsText);

    // const result = await generateActivityDiagram(project.requirements);
    if (!result.success) {
      return result;
    }
    const diagramDataString = JSON.stringify(result.data);
    console.log(diagramDataString);
    const newDiagram = new Diagram({
      name: "Activity Diagram",
      description: "Automatically generated activity diagram",
      type: "ActivityDiagram",
      data: diagramDataString,
      projectId,
      createdBy: userId,
    });

    const savedDiagram = await newDiagram.save();
    return { success: true, data: savedDiagram };
  } catch (error) {
    console.error("Error in createActivityDiagram:", error);
    return { success: false, message: error.message };
  }
};

const createClassDiagram = async (projectId, userId) => {
  try {
    const project = await Project.findById(projectId)
      .populate("requirements")
      .exec();
    if (!project) {
      return { success: false, message: "Project not found" };
    }

    const requirementsText = Array.isArray(project.requirements)
    ? project.requirements.map(req =>
        `Title: ${req.title}
  Description: ${req.description}
  Actors: ${Array.isArray(req.actor) ? req.actor.join(', ') : req.actor}
  Assignees: ${Array.isArray(req.assignee) ? req.assignee.join(', ') : req.assignee}
  Stakeholders: ${Array.isArray(req.stakeholders) ? req.stakeholders.join(', ') : req.stakeholders}
  Category: ${req.category}
  Priority: ${req.priority}
  Status: ${req.status}
  Acceptance Criteria: ${req.acceptanceCriteria}
  `
      ).join('\n')
    : String(project.requirements);

  const result = await generateClassDiagram(requirementsText);

    // const result = await generateClassDiagram(project.requirements);
    if (!result.success) {
      return result;
    }
    const diagramDataString = JSON.stringify(result.data);
    const newDiagram = new Diagram({
      name: "Class Diagram",
      description: "Automatically generated class diagram",
      type: "ClassDiagram",
      data: diagramDataString,
      projectId,
      createdBy: userId,
    });

    const savedDiagram = await newDiagram.save();
    return { success: true, data: savedDiagram };
  } catch (error) {
    console.error("Error in createClassDiagram:", error);
    return { success: false, message: error.message };
  }
};

const generateDiagrams = async (projectId, diagramTypes, userId) => {
  console.log("diagram generator called");
  try {
    for (const type of diagramTypes) {
      try {
        console.log(`Generating ${type} diagram...`);

        let generatedDiagram;
        switch (type) {
          case "activity":
            generatedDiagram = await createActivityDiagram(projectId, userId);
            break;
          case "class":
            generatedDiagram = await createClassDiagram(projectId, userId);
            break;
          case "usecase":
            generatedDiagram = await createUseCaseDiagram(projectId, userId);
            break;
          default:
            console.warn(`Unknown diagram type: ${type}`);
            continue;
        }

        if (generatedDiagram?.success) {
          await Project.findByIdAndUpdate(
            projectId,
            { $push: { diagrams: generatedDiagram.data._id } },
            { new: true }
          );
          console.log(`Successfully added ${type} diagram to project`);
        } else {
          console.log(`Failed to generate ${type} diagram`);
        }
      } catch (error) {
        console.error(`Error generating ${type} diagram:`, error);
      }
    }

    return {
      success: true,
      message: "Diagram generation completed",
    };
  } catch (error) {
    console.error("Error in generateDiagrams:", error);
    return { success: false, message: error.message };
  }
};

const getGenerationStatus = async (generationId) => {
  try {
    // In a real implementation, this would fetch from a database
    // For now, we'll return a mock status
    return {
      success: true,
      data: {
        status: {
          activity: "completed",
          class: "in_progress",
          usecase: "pending",
        },
        total: 3,
        completed: 1,
      },
    };
  } catch (error) {
    console.error("Error in getGenerationStatus:", error);
    return { success: false, message: error.message };
  }
};

module.exports = {
  createDiagram,
  deleteDiagram,
  getAllDiagrams,
  updateDiagram,
  getDiagramById,
  updateDiagramById,
  generateDiagrams,
  getGenerationStatus,
};
