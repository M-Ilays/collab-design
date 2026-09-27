import axios from "axios";
import ProjectImage from "../../../assets/ProjectImage.svg";
import Circle from "../../../utils/Shapes/Circle.jsx";
import PropTypes from "prop-types";
import { CiCircleCheck } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Message from "../../../overlays/Message.jsx";
import { FaRegFileArchive } from "react-icons/fa";
import api from "../../../api.js";
import { useAuth } from "../../../contexts/AuthContext.jsx";
import { BACKEND_URL } from "../../../constants/BACKEND.js";
import { FiEdit } from "react-icons/fi";
import PrimaryInput from "../../../utils/Inputs/PrimaryInput.jsx";
import PrimaryModal from "../../../utils/Modals/PrimaryModal.jsx";
import SecondaryInput from "../../../utils/Inputs/SecondaryInput.jsx";

const ProjectCard = ({
  projectId,
  projectName,
  teamMembers,
  refreshProjects,
  projectStatus,
  ownerId,
  projectDisplayPicture,
  description,
}) => {
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [stopNavigation, setStopNavigation] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [messageText, setMessageText] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProjectName, setEditProjectName] = useState(projectName);
  const [editDescription, setEditDescription] = useState(description || "");
  const [editImage, setEditImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(projectDisplayPicture);

  const handleEditSubmit = async () => {
    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("name", editProjectName);
    formData.append("description", editDescription);
    if (editImage) formData.append("image", editImage);

    try {
      const response = await api.put("api/project/update", formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMessageText(response?.data?.message);
      setShowConfirmation(true);
      setIsEditModalOpen(false);
      refreshProjects();
    } catch (error) {
      console.error("Error updating project:", error);
      setMessageText("Failed to update project.");
      setShowConfirmation(true);
    }
  };

  const { user } = useAuth();
  //delete this if else after cleaning db
  if (projectDisplayPicture == "default_project.jpg") {
    projectDisplayPicture = "";
  }

  const getColour = (index) => {
    const colors = [
      "bg-red-500",
      "bg-green-500",
      "bg-blue-500",
      "bg-yellow-400",
      "bg-primary",
    ];
    return colors[index];
  };

  const handleCardClick = (e) => {
    if (stopNavigation) {
      e.preventDefault();
      setStopNavigation(false);
    } else {
      navigate(`/project/${projectId}`);
    }
  };

  const updateProjectStatus = async (status) => {
    try {
      const response = await api.put(
        "api/project/update-status",
        {
          projectId,
          newStatus: status,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`, // Replace with your token logic
          },
        }
      );
      console.log("Project status updated:", response.data);
      let message;
      if (status == "Completed") {
        message = "The project is marked as completed";
      }
      if (status == "Active") {
        message = "The project is marked as active";
      }
      if (status == "Archived") {
        message = "The project is archived";
      }
      setMessageText(message);
    } catch (error) {
      console.error("Failed to update project status:", error);
      setMessageText("Failed to update the project status.");
    } finally {
      setShowConfirmation(true);
    }
  };

  const handleConfirmation = (action) => {
    setActionType(action);
    setStopNavigation(true);
    let status;
    if (action === "complete") {
      status = projectStatus === "Completed" ? "Active" : "Completed";
    } else if (action === "archive") {
      status = projectStatus === "Archived" ? "Active" : "Archived";
    }
    updateProjectStatus(status);
  };

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className={
        "flex pb-5 flex-col cursor-pointer bg-white dark:bg-dark shadow-md hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300 rounded-3xl p-4 w-[95%] md:w-[35%] lg:w-[25%] flex-shrink-0"
      }
      onClick={handleCardClick}
    >
      <img
        src={
          projectDisplayPicture
            ? BACKEND_URL + projectDisplayPicture
            : ProjectImage
        }
        alt={"Project Image"}
        className={"rounded-t-2xl h-36 object-cover"}
      />
      <div className={"flex flex-col my-4 mx-2"}>
        <div className={"flex justify-between items-center "}>
          <h2 className={"text-base sm:text-lg text-black dark:text-white"}>
            {projectName}
          </h2>
          {ownerId == user.id && (
            <div className={"pl-2 flex gap-4 items-center"}>
              <CiCircleCheck
                className={`${
                  projectStatus == "Completed"
                    ? "text-green-400  hover:text-green-700"
                    : "text-gray-700 hover:text-green-400 dark:text-gray-300"
                }   dark:hover:text-green-600 text-lg sm:text-2xl`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfirmation("complete");
                }}
              />
              <FaRegFileArchive
                className={`${
                  projectStatus == "Archived"
                    ? "text-red-500  hover:text-red-600 dark:text-red-400 dark:hover:text-red-600"
                    : "text-gray-700  dark:text-gray-300 hover:text-red-400 dark:hover:text-red-400"
                } text-gray-700 dark:text-gray-300 hover:text-red-400 dark:hover:text-red-400 text-base sm:text-xl`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfirmation("archive");
                }}
              />

              <FiEdit
                className={
                  "text-gray-700 dark:text-gray-300 hover:text-yellow-400 dark:hover:text-yellow-400 text-base sm:text-xl"
                }
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditModalOpen(true);
                }}
              />
            </div>
          )}
        </div>
        {description && (
          <h1 className="text-base text-neutral-600 dark:text-neutral-400">
            {description.length > 40
              ? `${description.slice(0, 40)}...`
              : description}
          </h1>
        )}
        <div className={"flex my-2 relative"}>
          {teamMembers &&
            teamMembers.map((teamMember, index) => {
              const value = screenWidth <= 640 ? 1 : 1.65;
              return (
                <Circle
                  ImageUrl={teamMember?.profilePicture}
                  key={index}
                  text={teamMember?.name.charAt(0).toUpperCase()}
                  colour={getColour(index)}
                  className={`absolute`}
                  style={{ left: `${index * value}rem` }}
                />
              );
            })}
        </div>
      </div>

      {isEditModalOpen && (
        <PrimaryModal
          heading="Edit Project"
          buttonText="Update"
          onClose={() => {
            setIsEditModalOpen(false);
          }}
          onSubmit={handleEditSubmit}
        >
          <div className="flex flex-col gap-2">
            <label className="text-base text-[#333333] dark:text-white font-semibold">
              Project Name
            </label>
            <SecondaryInput
              placeHolder="Project Name"
              value={editProjectName}
              onChange={(e) => {
                e.stopPropagation(); // Add this
                setEditProjectName(e.target.value);
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-base text-[#333333] dark:text-white font-semibold">
              Project Description
            </label>
            <SecondaryInput
              placeHolder="Description"
              value={editDescription}
              onChange={(e) => {
                e.stopPropagation(); // Add this
                setEditDescription(e.target.value);
              }}
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-black dark:text-white">
              Project Image
            </h3>
            <div className="relative group w-full  h-40">
              <img
                src={
                  editImage
                    ? URL.createObjectURL(editImage)
                    : previewImage
                    ? BACKEND_URL + previewImage
                    : ProjectImage
                }
                alt="Preview"
                className="w-full h-full object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center rounded-xl">
                <label className="border-gray-300 text-gray-300 border-2 px-4 py-2 rounded-lg cursor-pointer text-sm font-semibold">
                  Update Project Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      e.stopPropagation();
                      setEditImage(e.target.files[0]);
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        </PrimaryModal>
      )}

      {/* Show Confirmation Message */}
      {showConfirmation && (
        <div
          className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 dark:bg-opacity-20 z-10"
          onClick={() => {
            setShowConfirmation(false);
            refreshProjects();
          }}
        >
          <div className="relative">
            <Message
              text={messageText}
              onClose={(e) => {
                e.stopPropagation();
                setShowConfirmation(false);
                refreshProjects();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

ProjectCard.propTypes = {
  projectId: PropTypes.string.isRequired,
  projectName: PropTypes.string.isRequired,
  teamMembers: PropTypes.array.isRequired,
};

export default ProjectCard;
