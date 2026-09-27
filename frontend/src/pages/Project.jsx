import ProjectHeader from "../components/Project/ProjectHeader";
import ProjectStats from "../components/Project/ProjectStatsSection/ProjectStats";
import ProjectDetails from "../components/Project/ProjectDetailsSection/ProjectDetails";
import { useEffect, useState } from "react";
import api from "../api.js";
import { useParams } from "react-router-dom";
import ShowError from "../overlays/ShowError.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { HashLoader } from "react-spinners";
import VersionSlider from "../components/Project/Version/Slider.jsx";
import { AnimatePresence } from "framer-motion";
import Message from "../overlays/Message.jsx";

const Project = () => {
  const { id } = useParams(); // Project ID
  const [projectData, setProjectData] = useState(null); // Use `null` for uninitialized state
  const [versionedProjectData, setVersionedProjectData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const { user } = useAuth();
  const [showVersionSlider, setShowVersionSlider] = useState(false);
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [message, setMessage] = useState(""); // for success/failure feedback

  const fetchVersions = async () => {
    try {
      setLoadingVersions(true);
      const { data } = await api.get(`api/project/${id}/versions`);
      setVersions(data?.result || []);
    } catch (error) {
      console.error("Error fetching versions:", error);
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleRestoreVersion = async () => {
    if (!selectedVersion?._id) return;

    try {
      const { data } = await api.put(`/api/project/${id}/restoreVersion`, {
        versionId: selectedVersion._id,
      });

      // Check response status through message content or trust axios config
      if (data?.message?.toLowerCase().includes("restored")) {
        setMessage(
          "Project restored successfully to version: " + selectedVersion.name
        );
        await fetchProjectData(); // Refresh
        setSelectedVersion(null);
        localStorage.removeItem("selectedVersion");
      } else {
        setMessage("Restore failed: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Restore version failed:", error);
      setMessage(
        "Restore failed: " +
          (error.response?.data?.message || "An unexpected error occurred")
      );
    }
  };

  const handleVersionsClick = async () => {
    if (!showVersionSlider) {
      await fetchVersions();
    }
    setShowVersionSlider(!showVersionSlider);
  };

  const handleVersionClick = (version) => {
    console.log("version: ", version);
    setSelectedVersion(version);
    localStorage.setItem("selectedVersion", JSON.stringify(version));
    setVersionedProjectData((prev) => ({
      ...prev,
      requirements: version.requirements || [],
      diagrams: version.diagrams || [],
    }));
    setShowVersionSlider(false); // Optional: close slider
  };

  const resetVersion = () => {
    setVersionedProjectData(projectData);
    setSelectedVersion(null);
    localStorage.removeItem("selectedVersion");
  };

  const closeSlider = () => {
    setShowVersionSlider(false);
  };

  const fetchProjectData = async () => {
    try {
      const response = await api.get(`/api/project/${id}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
        validateStatus: (status) => status < 500,
      });

      if (response.status === 200) {
        // Extract the actual project data from the response
        const projectData = response.data.result?.data || response.data.result;
        setProjectData(projectData);
        setVersionedProjectData(projectData);
      } else {
        setErrorMessage(`Cannot retrieve data due to ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
      setErrorMessage(
        `Cannot retrieve data due to ${
          error.response?.data?.message || "an unknown error"
        }`
      );
    }
  };

  useEffect(() => {
    fetchProjectData();
    const storedVersion = localStorage.getItem("selectedVersion");
    if (storedVersion) {
      try {
        const parsedVersion = JSON.parse(storedVersion);
        setSelectedVersion(parsedVersion);
      } catch (e) {
        console.error("Error parsing stored selectedVersion:", e);
      }
    }
  }, [id, user?.token]); // Include dependencies

  const handleCloseError = () => setErrorMessage("");

  return (
    <>
      {message && <Message text={message} onClose={() => setMessage("")} />}

      <AnimatePresence>
        {showVersionSlider && (
          <VersionSlider
            onVersionClick={handleVersionClick}
            versions={versions}
            onClose={closeSlider}
            isLoading={loadingVersions}
            fetchVersions={fetchVersions}
          />
        )}
      </AnimatePresence>

      {projectData ? (
        <>
          <ProjectHeader
            projectName={projectData.name}
            projectStatus={projectData.status}
            selectedVersion={selectedVersion}
            resetVersion={resetVersion}
            handleRestoreVersion={handleRestoreVersion}
          />
          <ProjectStats
            requirementCount={projectData.requirements?.length || 0}
            diagramCount={projectData.diagrams?.length || 0}
            discussionCount={projectData.discussions?.length || 0}
            memberCount={(projectData.members?.length || 0) + 1}
          />
          <ProjectDetails
            data={versionedProjectData}
            refreshProject={fetchProjectData}
            handleVersionsClick={handleVersionsClick}
            selectedVersion={selectedVersion}
          />
        </>
      ) : (
        <div className="flex justify-center items-center min-h-screen">
          <HashLoader color={"#040413"} size={100} />
        </div>
      )}

      {errorMessage && (
        <ShowError text={errorMessage} onClose={handleCloseError} />
      )}
    </>
  );
};

export default Project;
