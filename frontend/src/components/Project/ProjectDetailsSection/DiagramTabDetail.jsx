import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { IoIosFolderOpen } from "react-icons/io";
import { FaMagic } from "react-icons/fa";

import api from "../../../api";
import ShowError from "../../../overlays/ShowError";

import PrimaryButton from "../../../utils/Buttons/PrimaryButton";
import SecondaryInput from "../../../utils/Inputs/SecondaryInput";
import PrimaryModal from "../../../utils/Modals/PrimaryModal";
import TextAreas from "../../../utils/Inputs/TextAreas";

import DiagramCard from "./Diagrams/DiagramCard";
import DiagramDetailsModal from "./Diagrams/DiagramDetailModel";
import Message from "../../../overlays/Message";

const DiagramTabDetail = ({
  diagrams = [],
  projectName,
  projectStatus,
  handleVersionsClick,
  selectedVersion,
  refreshProject, // Added to refresh parent data
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState("");

  const pathParts = location.pathname.split("/");
  const projectId = pathParts[2];

  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedDiagram, setSelectedDiagram] = useState(null);
  const [selectedDiagramTypes, setSelectedDiagramTypes] = useState([]);
  const [generationStatus, setGenerationStatus] = useState({});
  const [showProgress, setShowProgress] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Restore progress state from localStorage on mount
  useEffect(() => {
    const progress = localStorage.getItem("diagramShowProgress");
    const generating = localStorage.getItem("diagramIsGenerating");
    if (progress === "true") setShowProgress(true);
    if (generating === "true") setIsGenerating(true);
  }, []);

  // Whenever showProgress or isGenerating changes, update localStorage
  useEffect(() => {
    localStorage.setItem("diagramShowProgress", showProgress ? "true" : "false");
  }, [showProgress]);
  useEffect(() => {
    localStorage.setItem("diagramIsGenerating", isGenerating ? "true" : "false");
  }, [isGenerating]);

  const [diagramName, setDiagramName] = useState("");
  const [diagramDescription, setDiagramDescription] = useState("");
  const [diagramNameError, setDiagramNameError] = useState("");
  const [diagramDescriptionError, setDiagramDescriptionError] = useState("");

  const openCreateModal = () => {
    setShowCreateModal(true);
    setDiagramName("");
    setDiagramDescription("");
    setDiagramNameError("");
    setDiagramDescriptionError("");
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCreateDiagram = async () => {
    let hasError = false;
    if (!diagramName.trim()) {
      setDiagramNameError("Diagram name is required.");
      hasError = true;
    }
    if (!diagramDescription.trim()) {
      setDiagramDescriptionError("Description is required.");
      hasError = true;
    }
    if (hasError) return;

    try {
      const payload = { name: diagramName, description: diagramDescription };
      const res = await api.post(
        `/api/diagram/newDiagram/${projectId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 200) {
        closeCreateModal();
        refreshProject(); // Refresh parent data instead of local fetch
        const newId = res.data.message.diagramId;
        navigate(`Canvas/${newId}`, {
          state: { diagrams, projectName, projectStatus }, // Use diagrams from props
        });
      } else {
        ShowError({ text: res.data.message, onClose: () => {} });
      }
    } catch (err) {
      console.error("Error creating diagram:", err);
    }
  };

  const handleGenerateDiagrams = async () => {
    if (selectedDiagramTypes.length === 0) {
      ShowError({
        text: "Please select at least one diagram type",
        onClose: () => {},
      });
      return;
    }

    setShowGenerateModal(false);
    setShowProgress(true);
    setIsGenerating(true);
    setSelectedDiagramTypes([]);

    // These will be handled by the useEffect above, but you can set them here for clarity
    localStorage.setItem("diagramShowProgress", "true");
    localStorage.setItem("diagramIsGenerating", "true");

    console.log("Diagram Type", selectedDiagramTypes)
    try {
      const response = await api.post(
        `/api/diagram/generate/${projectId}`,
        { diagramTypes: selectedDiagramTypes },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        setMessageText(response.data.message.message);
        setShowMessage(true);
        setShowProgress(false);
        setIsGenerating(false);
        localStorage.removeItem("diagramShowProgress");
        localStorage.removeItem("diagramIsGenerating");
        refreshProject();
      } else {
        const errorMsg = response.data?.message?.message;
        const fallbackMsg = "Failed to generate diagrams";
      
        setMessageText(
          typeof errorMsg === "string"
            ? errorMsg
            : fallbackMsg
        );
      
        setShowMessage(true);
        setShowProgress(false);
        setIsGenerating(false);
        localStorage.removeItem("diagramShowProgress");
        localStorage.removeItem("diagramIsGenerating");
        refreshProject();
      }
      
    } catch (err) {
      console.error("Error generating diagrams:", err);
      let errorMessage = "Failed to generate diagrams";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setMessageText(errorMessage);
      setShowProgress(false);
      setIsGenerating(false);
      setShowMessage(true);
      // Clear localStorage
      localStorage.removeItem("diagramShowProgress");
      localStorage.removeItem("diagramIsGenerating");
    }
  };

  // const pollGenerationStatus = async (generationId) => {
  //   try {
  //     const response = await api.get(
  //       `/api/diagram/generation-status/${generationId}`,
  //       {
  //         headers: { Authorization: `Bearer ${user?.token}` },
  //       }
  //     );

  //     if (response.data.success && response.data.data) {
  //       setGenerationStatus(response.data.data.status || {});

  //       const { total, completed } = response.data.data;
  //       if (completed < total) {
  //         setTimeout(() => pollGenerationStatus(generationId), 2000);
  //       } else {
  //         setShowProgress(false);
  //         setIsGenerating(false);
  //         refreshProject(); // Refresh parent data instead of local fetch
  //       }
  //     } else {
  //       console.error("Invalid response format:", response.data);
  //       const errorMessage =
  //         typeof response.data?.message === "string"
  //           ? response.data.message
  //           : "Failed to check generation status";
  //       ShowError({ text: errorMessage, onClose: () => {} });
  //       setShowProgress(false);
  //       setIsGenerating(false);
  //     }
  //   } catch (err) {
  //     console.error("Error checking generation status:", err);
  //     let errorMessage = "Failed to check generation status";

  //     if (err.response?.data?.message) {
  //       errorMessage = err.response.data.message;
  //     } else if (err.message) {
  //       errorMessage = err.message;
  //     }

  //     ShowError({ text: errorMessage, onClose: () => {} });
  //     setShowProgress(false);
  //     setIsGenerating(false);
  //   }
  // };

  const toggleDiagramType = (type) => {
    setSelectedDiagramTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const filteredDiagrams = Array.isArray(diagrams)
    ? diagrams.filter(
        (d) =>
          typeof d === "object" &&
          d !== null &&
          d.name?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <>
      {showMessage && (
        <Message
          text={messageText}
          onClose={() => {
            setShowMessage(false);
            setShowProgress(false);
            setIsGenerating(false);
            setGenerationStatus({});
          }}
        />
      )}
      <section className="py-6 rounded-md bg-white dark:bg-dark px-4">
        {showProgress && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
            <h2 className="text-lg font-bold  text-gray-900 dark:text-gray-100">
  {isGenerating
    ? "Diagram Generation in progress..."
    : "Generating Diagrams..."}
</h2>
            <div className="space-y-3">
              {Object.entries(generationStatus).map(([type, status]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                      {type.replace("_", " ")}
                    </span>
                    {(status === "in_progress" ||
                      (isGenerating && status === "pending")) && (
                      <div className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full" />
                    )}
                  </div>
                  <span
                    className={`
                  text-sm font-medium px-2 py-1 rounded-full
                  ${
                    status === "completed"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : status === "in_progress" ||
                        (isGenerating && status === "pending")
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : status === "failed"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                  }
                `}
                  >
                    {status === "completed"
                      ? "Completed"
                      : status === "in_progress" ||
                        (isGenerating && status === "pending")
                      ? "In Progress"
                      : status === "failed"
                      ? "Failed"
                      : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="hidden md:flex justify-between items-center mb-4">
          {projectStatus === "Active" && (!selectedVersion) ? (
            <div className="flex gap-3">
              <PrimaryButton text="+ New Diagram" action={openCreateModal} />
              <PrimaryButton
                text="Generate"
                action={() => setShowGenerateModal(true)}
                icon={<FaMagic className="mr-2" />}
              />
            </div>
          ) : (
            <div />
          )}
          <div className="flex items-center space-x-3">
            <PrimaryButton text="Versions" action={handleVersionsClick} />
            <SecondaryInput
              placeHolder="Search diagrams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-y-3 mb-4 md:hidden">
          <SecondaryInput
            placeHolder="Search diagrams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex items-center gap-3">
            {(!selectedVersion) && (
              <>
                <PrimaryButton text="+" action={openCreateModal} />
                <PrimaryButton
                  text="Generate"
                  action={() => setShowGenerateModal(true)}
                  icon={<FaMagic className="mr-2" />}
                />
              </>
            )}
            <PrimaryButton text="Versions" action={handleVersionsClick} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDiagrams.length > 0 ? (
            filteredDiagrams.map((diagram) => (
              <DiagramCard
                selectedVersion={selectedVersion}
                key={diagram._id}
                id={diagram._id}
                name={diagram.name}
                description={diagram.description}
                refreshDiagrams={refreshProject} // Use refreshProject instead of fetchDiagrams
                onClick={() => setSelectedDiagram(diagram)}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center py-12 text-gray-500 dark:text-gray-400">
              <IoIosFolderOpen size={48} />
              <p className="mt-2">No diagrams available</p>
            </div>
          )}
        </div>

        {showCreateModal && (
          <PrimaryModal
            onClose={closeCreateModal}
            heading="New Diagram"
            buttonText="Create"
            onSubmit={handleCreateDiagram}
          >
            <form className="flex flex-col gap-6 w-full">
              <div className="w-full">
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                  Diagram Name
                </label>
                <SecondaryInput
                  placeHolder="Enter diagram name"
                  value={diagramName}
                  onChange={(e) => {
                    setDiagramName(e.target.value);
                    setDiagramNameError("");
                  }}
                  error={diagramNameError}
                  className="w-full"
                />
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                  Description
                </label>
                <TextAreas
                  placeholder="Description..."
                  value={diagramDescription}
                  onChange={(e) => {
                    setDiagramDescription(e.target.value);
                    setDiagramDescriptionError("");
                  }}
                  error={diagramDescriptionError}
                />
              </div>
            </form>
          </PrimaryModal>
        )}

        {showGenerateModal && (
          <PrimaryModal
            onClose={() => {
              setShowGenerateModal(false);
              setSelectedDiagramTypes([]);
              setGenerationStatus({});
            }}
            heading="Generate Diagrams"
            buttonText="Generate"
            onSubmit={handleGenerateDiagrams}
          >
            <div className="flex flex-col gap-6">
              <p className="text-gray-600 dark:text-gray-300">
                Select the types of diagrams you want to generate:
              </p>

              <div className="grid grid-cols-1 gap-4">
                {[
                  // {
                  //   id: "activity",
                  //   label: "Activity Diagram",
                  //   description: "Shows the flow of activities in a process",
                  // },
                  {
                    id: "class",
                    label: "Class Diagram",
                    description:
                      "Shows the structure of classes and their relationships",
                  },
                  {
                    id: "usecase",
                    label: "Use Case Diagram",
                    description:
                      "Shows the interactions between users and system",
                  },
                ].map((type) => (
                  <div
                    key={type.id}
                    className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${
                      selectedDiagramTypes.includes(type.id)
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                    }
                  `}
                    onClick={() => toggleDiagramType(type.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${
                        selectedDiagramTypes.includes(type.id)
                          ? "border-purple-500 bg-purple-500"
                          : "border-gray-300 dark:border-gray-600"
                      }
                    `}
                      >
                        {selectedDiagramTypes.includes(type.id) && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {type.label}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PrimaryModal>
        )}

        {selectedDiagram && (
          <DiagramDetailsModal
            diagram={selectedDiagram}
            onClose={() => setSelectedDiagram(null)}
            refreshDiagrams={refreshProject} // Use refreshProject instead of fetchDiagrams
          />
        )}
      </section>
    </>
  );
};

export default DiagramTabDetail;
