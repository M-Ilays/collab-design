import React, { useRef, useEffect, useCallback, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { Loader2, Download, ChevronDown, Save, Settings } from "lucide-react";
import api from "../../api";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

// Define ApollonMode enum to match the library
const ApollonMode = {
  Modelling: "Modelling",
  Exporting: "Exporting",
  Assessment: "Assessment",
};

export default function Canvas({ versionId }) {
  const containerRef = useRef(null);
  const moduleRef = useRef(null);
  const mountedRef = useRef(false);
  const { isDarkMode } = useTheme();
  const [diagramType, setDiagramType] = useState("ClassDiagram");
  const [isLoading, setIsLoading] = useState(true);
  const [isDiagramDropdownOpen, setIsDiagramDropdownOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [currentMode, setCurrentMode] = useState(ApollonMode.Modelling);
  const { diagramId } = useParams();
  const { user } = useAuth();
  const [diagramName, setDiagramName] = useState("");

  // Helper function to safely unmount Apollon
  const safeUnmount = useCallback(async () => {
    if (moduleRef.current && mountedRef.current) {
      try {
        // Use setTimeout to defer unmounting to avoid synchronous unmount during render
        await new Promise((resolve) => {
          setTimeout(() => {
            try {
              moduleRef.current?.unmountApollon();
            } catch (error) {
              console.warn("Error during unmount:", error);
            }
            mountedRef.current = false;
            resolve();
          }, 0);
        });
      } catch (error) {
        console.warn("Error during safe unmount:", error);
      }
    }
  }, []);

  // Helper function to safely save diagram
  const safeSave = useCallback(async () => {
    if (!moduleRef.current || !mountedRef.current) {
      return null;
    }

    try {
      // Check if editor exists before saving
      if (moduleRef.current.editor) {
        await moduleRef.current.save();
        return localStorage.getItem("Apollon");
      }
    } catch (error) {
      console.warn("Error during save:", error);
    }
    return null;
  }, []);

  useEffect(() => {
    const initializeApollon = async () => {
      if (!containerRef.current) return;

      setIsLoading(true);

      // Safely unmount any existing instance
      await safeUnmount();

      let initialModel;
      try {
        const response = await api.get(`/api/diagram/get/${diagramId}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const jsonStr = response.data?.message?.data;
        const name = response.data?.message?.name;

        if (name) {
          setDiagramName(name);
        }

        if (jsonStr) {
          localStorage.setItem("Apollon", jsonStr);
          initialModel = JSON.parse(jsonStr);
        }
      } catch (err) {
        console.error("Failed to fetch diagram:", err);
      }

      try {
        const mod = await import("../../../../Apollon/public/index");
        moduleRef.current = mod;

        // Mount with a small delay to ensure container is ready
        setTimeout(() => {
          if (containerRef.current && !mountedRef.current) {
            try {
              mod.mountApollon(containerRef.current, {
                type: diagramType,
                model: initialModel,
                mode: currentMode,
              });
              mountedRef.current = true;
              if (mod.setTheming) {
                mod.setTheming(isDarkMode ? "dark" : "light");
              }
            } catch (error) {
              console.error("Error mounting Apollon:", error);
            }
          }
          setIsLoading(false);
        }, 100);
      } catch (err) {
        console.error("Failed to load Apollon:", err);
        setIsLoading(false);
      }
    };

    initializeApollon();

    return () => {
      // Cleanup on unmount
      if (mountedRef.current) {
        setTimeout(() => {
          try {
            moduleRef.current?.unmountApollon();
          } catch (error) {
            console.warn("Cleanup error:", error);
          }
        }, 0);
      }
    };
  }, [diagramId, user?.token]); // Removed diagramType and currentMode from dependencies

  const handleDiagramTypeChange = useCallback(
    async (newType) => {
      if (newType === diagramType) return;

      setIsLoading(true);
      setDiagramType(newType);
      setIsDiagramDropdownOpen(false);

      try {
        // Save current state
        const savedModel = await safeSave();

        // Safely unmount current instance
        await safeUnmount();

        // Mount new instance with delay
        setTimeout(() => {
          if (
            moduleRef.current &&
            containerRef.current &&
            !mountedRef.current
          ) {
            try {
              moduleRef.current.mountApollon(containerRef.current, {
                type: newType,
                mode: currentMode,
                model: savedModel ? JSON.parse(savedModel) : undefined,
              });
              mountedRef.current = true;
            } catch (error) {
              console.error("Error remounting with new type:", error);
            }
          }
          setTimeout(() => setIsLoading(false), 200);
        }, 100);
      } catch (error) {
        console.error("Error changing diagram type:", error);
        setIsLoading(false);
      }
    },
    [diagramType, currentMode, safeSave, safeUnmount]
  );

  const handleModeChange = useCallback(
    async (newMode) => {
      if (newMode === currentMode) return;

      setIsLoading(true);
      setCurrentMode(newMode);
      setIsModeDropdownOpen(false);

      try {
        // Save current state before mode change
        const savedModel = await safeSave();

        // For Assessment mode, we need to remount the component entirely
        // because the setMode method might not work reliably
        await safeUnmount();

        // Mount new instance with the new mode
        setTimeout(() => {
          if (
            moduleRef.current &&
            containerRef.current &&
            !mountedRef.current
          ) {
            try {
              moduleRef.current.mountApollon(containerRef.current, {
                type: diagramType,
                mode: newMode, // Use the original case, not lowercase
                model: savedModel ? JSON.parse(savedModel) : undefined,
              });
              mountedRef.current = true;
            } catch (error) {
              console.error("Error remounting with new mode:", error);
            }
          }
          setTimeout(() => setIsLoading(false), 300);
        }, 100);
      } catch (error) {
        console.error("Error changing mode:", error);
        setIsLoading(false);
      }
    },
    [currentMode, diagramType, safeSave, safeUnmount]
  );

  const handleExport = useCallback(async (format = "svg") => {
    setIsExportDropdownOpen(false);

    if (!moduleRef.current || !mountedRef.current) return;

    try {
      await moduleRef.current.nextRender;

      if (format === "svg") {
        moduleRef.current.draw();
      } else {
        const { svg } = await moduleRef.current.editor.exportAsSVG({
          scale: moduleRef.current.editor.getScaleFactor(),
        });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const img = new Image();
        const svgBlob = new Blob([svg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;

          // Fill background with white for both PNG and JPEG
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.drawImage(img, 0, 0);
          const mimeType = format === "png" ? "image/png" : "image/jpeg";
          const quality = format === "jpeg" ? 0.85 : undefined;

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const downloadUrl = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = downloadUrl;
                link.download = `Diagram.${format}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(downloadUrl);
              }
            },
            mimeType,
            quality
          );

          URL.revokeObjectURL(url);
        };

        img.src = url;
      }
    } catch (error) {
      console.error(`Error exporting as ${format}:`, error);
    }
  }, []);

  const handleSave = useCallback(async () => {
    try {
      const diagram = await safeSave();

      if (diagram) {
        await api.put(
          `/api/diagram/${diagramId}`,
          {
            data: diagram,
          },
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setShowSaveMessage(true);
        setTimeout(() => {
          setShowSaveMessage(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Error saving diagram:", error);
    }
  }, [diagramId, user?.token, safeSave]);

  // Handle theme changes
  useEffect(() => {
    if (
      moduleRef.current &&
      mountedRef.current &&
      moduleRef.current.setTheming
    ) {
      try {
        moduleRef.current.setTheming(isDarkMode ? "dark" : "light");
      } catch (error) {
        console.warn("Error setting theme:", error);
      }
    }
  }, [isDarkMode]);

  const diagramOptions = [
    { value: "ClassDiagram", label: "Class Diagram" },
    { value: "ObjectDiagram", label: "Object Diagram" },
    { value: "ActivityDiagram", label: "Activity Diagram" },
    { value: "SequenceDiagram", label: "Sequence Diagram" },
    { value: "UseCaseDiagram", label: "Use Case Diagram" },
    { value: "CommunicationDiagram", label: "Communication Diagram" },
    { value: "ComponentDiagram", label: "Component Diagram" },
    { value: "DeploymentDiagram", label: "Deployment Diagram" },
    { value: "PetriNet", label: "Petri Net" },
    { value: "ReachabilityGraph", label: "Reachability Graph" },
    { value: "SyntaxTree", label: "Syntax Tree" },
    { value: "Flowchart", label: "Flowchart" },
    { value: "BPMN", label: "BPMN" },
  ];

  const modeOptions = [
    { value: ApollonMode.Modelling, label: "Editing" },
    { value: ApollonMode.Assessment, label: "FeedBack" },
    // { value: ApollonMode.Exporting, label: "Exporting" }
  ];

  const exportOptions = [
    { value: "svg", label: "SVG" },
    { value: "png", label: "PNG" },
    { value: "jpeg", label: "JPEG" },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDiagramDropdownOpen || isExportDropdownOpen || isModeDropdownOpen) {
        if (!event.target.closest(".dropdown-container")) {
          setIsDiagramDropdownOpen(false);
          setIsExportDropdownOpen(false);
          setIsModeDropdownOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDiagramDropdownOpen, isExportDropdownOpen, isModeDropdownOpen]);

  // Only show diagram type and export options in Modelling mode
  const isModellingMode = currentMode === ApollonMode.Modelling;

  return (
    <div className="w-full h-full flex flex-col rounded-lg shadow-md bg-white dark:bg-gray-800 overflow-hidden">
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {diagramName || "Untitled Diagram"}
        </h2>

        <div className="flex items-center space-x-3">
          {/* Mode Selection Dropdown */}
          <div className="relative dropdown-container">
            <button
              onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
              className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <Settings size={18} className="mr-2" />
              <span>
                {modeOptions.find((opt) => opt.value === currentMode)?.label}
              </span>
              <ChevronDown
                size={18}
                className={`ml-2 transition-transform duration-200 ${
                  isModeDropdownOpen ? "transform rotate-180" : ""
                }`}
              />
            </button>

            {isModeDropdownOpen && (
              <div className="absolute z-10 mt-1 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 overflow-hidden">
                {modeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleModeChange(option.value)}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150 ${
                      currentMode === option.value
                        ? "bg-gray-100 dark:bg-gray-600 font-medium"
                        : ""
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Diagram Type Dropdown - Only show in Modelling mode */}
          {isModellingMode && (
            <div className="relative dropdown-container">
              <button
                onClick={() => setIsDiagramDropdownOpen(!isDiagramDropdownOpen)}
                className="flex items-center justify-between w-64 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <span>
                  {
                    diagramOptions.find((opt) => opt.value === diagramType)
                      ?.label
                  }
                </span>
                <ChevronDown
                  size={18}
                  className={`ml-2 transition-transform duration-200 ${
                    isDiagramDropdownOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              {isDiagramDropdownOpen && (
                <div className="absolute z-10 mt-1 w-64 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 overflow-hidden">
                  {diagramOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleDiagramTypeChange(option.value)}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150 ${
                        diagramType === option.value
                          ? "bg-gray-100 dark:bg-gray-600 font-medium"
                          : ""
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Export Dropdown - Only show in Modelling mode */}
          {isModellingMode && (
            <div className="relative dropdown-container">
              <button
                onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                className="flex items-center px-4 py-2 bg-primary hover:bg-purple-800 text-white rounded-lg transition-colors duration-200 shadow-sm"
              >
                <Download size={18} className="mr-2" />
                Export
                <ChevronDown
                  size={18}
                  className={`ml-2 transition-transform duration-200 ${
                    isExportDropdownOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              {isExportDropdownOpen && (
                <div className="absolute right-0 z-10 mt-1 w-36 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 overflow-hidden">
                  {exportOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleExport(option.value)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Save Button - Always visible */}
          {!versionId && (
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-primary hover:bg-purple-800 text-white rounded-lg transition-colors duration-200 shadow-sm"
            >
              <Save size={18} className="mr-2" />
              Save
            </button>
          )}
        </div>
      </div>

      <div className="relative flex-grow">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 z-10">
            <div className="flex flex-col items-center">
              <Loader2
                size={40}
                className="animate-spin text-blue-600 dark:text-blue-400"
              />
              <p className="mt-2 text-gray-600 dark:text-gray-300 font-medium">
                Loading diagram...
              </p>
            </div>
          </div>
        )}
        <div
          id="apollon"
          ref={containerRef}
          className="h-full border border-gray-200 dark:border-gray-700"
          style={{ minHeight: 500 }}
        />
      </div>

      {showSaveMessage && (
        <div className="absolute top-6 right-6 z-30 animate-spring">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-md
        bg-white/90 dark:bg-gray-800/90
        border border-gray-200 dark:border-gray-600
        shadow-lg shadow-primary/10
        text-gray-800 dark:text-gray-100
        font-medium text-sm"
          >
            <div className="p-1.5 rounded-full bg-primary/10">
              <Save size={18} className="text-primary" />
            </div>
            <span className="tracking-wide">Diagram saved successfully!</span>
          </div>
        </div>
      )}
    </div>
  );
}
