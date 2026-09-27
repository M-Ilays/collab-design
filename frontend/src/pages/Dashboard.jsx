import { useState, useEffect } from "react";
import DashboardHeader from "../components/Dashboard/DashboardHeader.jsx";
import StatContainer from "../components/Dashboard/StatContainer.jsx";
import ProjectContainer from "../components/Dashboard/Projects/ProjectContainer.jsx";
import { IoFilterCircleOutline } from "react-icons/io5";
import H1 from "../utils/Headings/H1.jsx";
import PrimaryButton from "../utils/Buttons/PrimaryButton.jsx";
import SecondaryInput from "../utils/Inputs/SecondaryInput.jsx";
import PrimaryModal from "../utils/Modals/PrimaryModal.jsx";
import Circle from "../utils/Shapes/Circle.jsx";
import PrimaryDropDown from "../utils/Menus/PrimaryDropDown.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import api from "../api.js";
import { GrProjects } from "react-icons/gr";
import { ImFilesEmpty } from "react-icons/im";
import { TbFiles } from "react-icons/tb";
import OverLappingCircles from "../utils/Shapes/OverLappingCircles.jsx";
import getUser from "../getUser.js";
import Message from "../overlays/Message.jsx";

// A repeating palette for avatars
const avatarColors = [
  "#EF4444", 
  "#22C55E",  
  "#3B82F6",  
  "#FACC15",  
  "#764BA2",  
];


const Dashboard = () => {
  const [hoveredMember, setHoveredMember] = useState(null);
  const [visibleContainer, setVisibleContainer] = useState("Recent Projects");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, setUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    projectImage: "",
    members: [],
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    ongoingProjects: 0,
    sharedProjects: 0,
  });
  console.log("user =", user);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProjectData((prevData) => ({ ...prevData, projectImage: file }));
    }
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };



  const projectList = Array.isArray(projects) ? projects : [];
  const filteredProjects = projectList.map((container) => ({
    ...container,
    data: (container.data || []).filter((project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }));
  const fetchProjects = async () => {
    try {
      const response = await api.get("/api/project/user-projects", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const projectGroups = Array.isArray(response.data) ? response.data : [];
      setProjects(projectGroups);
      const sharedProjectsCategory = projectGroups.find(
        (category) => category.title === "Shared Projects"
      );
      const userProjectsCategory = projectGroups.find(
        (category) => category.title === "My Projects"
      );

      const sharedProjects = sharedProjectsCategory?.data.length || 0;
      const userProjects = userProjectsCategory?.data.length || 0;

      const completedProjects =
        projectGroups.find(
          (category) => category.title === "Completed Projects"
        )?.data.length || 0;
      const totalProjects = sharedProjects + userProjects + completedProjects;
      const ongoingProjects = userProjects + sharedProjects;

      setStats({
        totalProjects,
        completedProjects,
        ongoingProjects,
        sharedProjects,
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };
  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getUser(user.token);
        setUser((prevUser) => ({
          ...prevUser,
          ...response,
        }));
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    if (user?.token) {
      fetchUserData();
    }
  }, [user?.token, setUser]);

  const handleContainerChange = (title) => {
    setVisibleContainer(title);
  };

  const handleInputChange = (field, value) => {
    setProjectData((prevData) => ({ ...prevData, [field]: value }));
  };

  const handleAddProject = async () => {
    if (!projectData.name.trim()) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        name: "Project name is required",
        general: "",
      }));
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", projectData.name.trim());
      formData.append("description", projectData.description);
      if (projectData.projectImage instanceof File) {
        formData.append("projectImage", projectData.projectImage);
      }
      projectData.members.forEach((email, index) =>
        formData.append(`members[${index}]`, email)
      );

      const response = await api.post("/api/project/create", formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status >= 400 || response.data?.success === false) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          general:
            response.data?.message ||
            "Failed to create project. Please try again.",
        }));
        return;
      }

      setIsModalOpen(false);
      setErrors({});
      setProjectData({
        name: "",
        description: "",
        projectImage: "",
        members: [],
      });
      setSuccessMessage("Project created successfully.");
      fetchProjects();
    } catch (error) {
      console.error("Error creating project:", error);
      setErrors((prevErrors) => ({
        ...prevErrors,
        general: "Failed to create project. Please try again.",
      }));
    }
  };

  const handleMembersEmailValidation = (e) => {
    const email = e.target.value;
    if (!/\S+@\S+\.\S+/.test(email)) {
      // If email is invalid, set the error
      e.target.value = "";
      setErrors((prevErrors) => ({
        ...prevErrors,
        members: "Invalid email format.",
      }));
    } else {
      // If email is valid, add the member
      setProjectData((prevData) => ({
        ...prevData,
        members: [...prevData.members, email],
      }));
      e.target.value = ""; // Clear input after adding
      setErrors((prevErrors) => ({ ...prevErrors, members: "" })); // Clear error if valid email
    }
  };

  const renderMobileView = () => (
    <div className="block md:hidden">
      <div className="flex flex-col px-5 gap-2 relative">
        {/* Header with Filter Icon */}
        <div className="flex items-center justify-between ">
          <H1 Text={visibleContainer} />
          <PrimaryDropDown
            trigger={
              <IoFilterCircleOutline className=" z-0 cursor-pointer text-primary text-2xl" />
            }
            menuItems={projects.map((container) => ({
              label: container.title,
              onClick: () => handleContainerChange(container.title),
            }))}
            align="right"
            className="absolute z-10 top-10 right-0 bg-white shadow-lg rounded-md w-48 p-2 mx-2"
          />
        </div>

        {/* Search and Add New Button */}
        <div className="flex items-center justify-center w-full gap-2">
          <SecondaryInput
            placeHolder="Search Project"
            className="h-10 w-full"
          />
          {visibleContainer === "Recent Projects" && (
            <PrimaryButton
              action={() => setIsModalOpen(true)}
              text="+ New"
              className="text-sm md:text-lg h-10 justify-center items-center"
            />
          )}
        </div>

        {/* Render Project Container */}
        {projects
          .filter((container) => container.title === visibleContainer)
          .map((container) => (
            <ProjectContainer
              refreshProjects={fetchProjects}
              key={container.title}
              title={container.title}
              data={container.data}
            />
          ))}
      </div>
    </div>
  );

  const renderDesktopView = () => {
    let buttonRendered = false; // Flag to track if the button is already rendered
    const allContainersEmpty = filteredProjects.every(
      (container) => container.data.length === 0
    );
    if (allContainersEmpty && searchQuery == "") {
      return (
        <div className="hidden md:flex   justify-center  h-[100dvh]">
          <div className=" w-fit h-fit rounded-xl mt-20 py-5 px-8 flex flex-col items-center  bg-gray-50 dark:bg-dark-50 shadow-lg text-center">
            <TbFiles className="text-gray-500 dark:text-gray-200" size={28} />
            <p className="text-lg font-semibold text-gray-500 dark:text-white my-4">
              You have no active projects.
            </p>
            <PrimaryButton
              action={() => setIsModalOpen(true)}
              text="Create a New Project"
              className="text-sm md:text-base"
            />
          </div>
        </div>
      );
    }
    return (
      <div className="hidden md:block ml-5">
        {filteredProjects.map((container) => {
          const shouldRenderButton =
            container.data.length > 0 && !buttonRendered;

          if (shouldRenderButton) {
            buttonRendered = true; // Update the flag
          }

          if (container.data.length > 0) {
            return (
              <div key={container.title} className="mb-8">
                <div className="flex justify-between px-5 mx-5 md:mx-10 gap-2">
                  {container.data.length > 0 && <H1 Text={container.title} />}
                  {shouldRenderButton && (
                    <PrimaryButton
                      action={() => setIsModalOpen(true)}
                      text="+ New"
                      className="text-sm md:text-lg"
                    />
                  )}
                </div>
                {container.data.length > 0 && (
                  <ProjectContainer
                    refreshProjects={fetchProjects}
                    key={container.title}
                    title={container.title}
                    data={container.data}
                  />
                )}
              </div>
            );
          }
        })}
      </div>
    );
  };

  const renderNewProjectModal = () => (
    <PrimaryModal
      onClose={() => {
        setIsModalOpen(false);
        setProjectData({
          name: "",
          description: "",
          projectImage: "",
          members: [],
        });
      }}
      heading="New Project"
      buttonText="Create"
      onSubmit={handleAddProject}
    >
      <div className="flex flex-col gap-4">
        {errors?.general ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {errors.general}
          </p>
        ) : null}
        <div className="flex flex-col gap-2">
          <label className="text-base text-[#333333] dark:text-white font-semibold">
            Name
          </label>
          <SecondaryInput
            onChange={(e) => {
              handleInputChange("name", e.target.value);
              if (errors?.name) {
                setErrors((prevErrors) => ({ ...prevErrors, name: "" }));
              }
            }}
            placeHolder="Enter project name"
            isRequired={true}
            error={errors?.name}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-base text-[#333333] dark:text-white font-semibold">
            Description
          </label>
          <textarea
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Enter project description (optional)"
            className="h-20 w-full resize-none rounded border border-gray-300 px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-dark dark:text-white"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base text-[#333333] dark:text-white font-semibold">
            Add members
          </label>
          <SecondaryInput
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value) {
                handleMembersEmailValidation(e);
              }
            }}
            placeHolder={"Enter members' email"}
            type={"email"}
            error={errors?.members}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-base font-semibold text-[#333333] dark:text-white">
            Added members
          </label>
          <div className="flex min-h-10 items-center">
    {projectData.members.map((member, index) => {
      const bgColor = avatarColors[index % avatarColors.length];
      const isHovered = hoveredMember === index;

      return (
        <div
          key={index}
          className={`relative group ${index > 0 ? "-ml-3" : ""}`}
          onMouseEnter={() => setHoveredMember(index)}
          onMouseLeave={() => setHoveredMember(null)}
          style={{
            // base z-index = position in list; hovered = bump above all
            zIndex: isHovered ? projectData.members.length + 1 : index + 1,
          }}
        >
          {/* Avatar circle */}
          <div
            title={member}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer shadow-sm"
            style={{ backgroundColor: bgColor }}
          >
            {member.charAt(0).toUpperCase()}
          </div>

          {/* Remove button on hover */}
          <button
            onClick={() =>
              setProjectData((prev) => ({
                ...prev,
                members: prev.members.filter((_, i) => i !== index),
              }))
            }
            className="hidden group-hover:flex items-center justify-center absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs z-50"
            title="Remove member"
          >
            ✕
          </button>
        </div>
      );
    })}
  </div>
</div>

        <div className="flex flex-col items-center gap-2">
          <label className="text-base font-semibold text-[#333333] dark:text-white">
            Project Image
          </label>

          {projectData.projectImage ? (
            <div className="relative h-28 w-28">
      <img
        src={URL.createObjectURL(projectData.projectImage)}
        alt="Preview"
        className="w-full h-full object-cover rounded-lg border border-gray-300 shadow-sm"
      />
      <button
        type="button"
        onClick={() =>
          setProjectData((prev) => ({ ...prev, projectImage: "" }))
        }
        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
        title="Remove image"
      >
        ✕
      </button>
    </div>
  ) : (
            <label className="flex h-28 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-600 transition hover:border-purple-600 dark:text-gray-300">
      <span className="text-sm">Click or drag to upload</span>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file?.type.startsWith("image/")) {
            setProjectData((prev) => ({ ...prev, projectImage: file }));
          }
        }}
        className="hidden"
      />
    </label>
  )}
</div>

      </div>
    </PrimaryModal>
  );

  return (
    <div className="bg-white dark:bg-dark-900">
      {successMessage ? (
        <Message text={successMessage} onClose={() => setSuccessMessage("")} />
      ) : null}
      <DashboardHeader onSearchChange={handleSearchChange} />
      <StatContainer stats={stats} />

      <div className="mt-4 ml-2 ">
        {renderMobileView()}
        {renderDesktopView()}
      </div>
      {isModalOpen && renderNewProjectModal()}
    </div>
  );
};

export default Dashboard;
