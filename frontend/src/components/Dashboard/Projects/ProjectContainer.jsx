import PropTypes from "prop-types";
import ProjectCard from "./ProjectCard.jsx";

const ProjectContainer = ({ data, refreshProjects }) => {
  return (
    <div
      className={
        "flex flex-col md:flex-row items-center justify-center md:justify-start gap-8 overflow-x-auto scrollbar-hidden py-2 my-2 md:mx-10"
      }
    >
      {data &&
        data.map((project, index) => (
          <ProjectCard
            projectDisplayPicture={project.projectImage}
            refreshProjects={refreshProjects}
            projectId={project.projectId}
            projectStatus={project.status}
            ownerId={project.ownerId}
            key={index}
            projectName={project.name}
            teamMembers={project.teamMembers}
            description={project.description}
          />
        ))}
    </div>
  );
};

ProjectContainer.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
};

export default ProjectContainer;
