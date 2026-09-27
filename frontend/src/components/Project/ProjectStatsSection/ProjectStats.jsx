import StatCard from "./StatCard";
import { FcDocument } from "react-icons/fc";
import { FaPencilAlt } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { ImBubbles } from "react-icons/im";
import PropTypes from "prop-types";

const ProjectStats = ({requirementCount, diagramCount, memberCount, discussionCount }) => {
  return (
    <section className="lg:grid bg-white dark:bg-dark grid-cols-4 gap-4  py-6 border-b  border-gray-200 dark:border-0 hidden lg:px-28 xl:px-40">
      {[
        {
          title: "Requirements",
          value: requirementCount || 0,
          icon: <FcDocument size={24} />,
          bg: "#DBEAFE",
        },
        {
          title: "Diagrams",
          value: diagramCount || 0,
          icon: <FaPencilAlt size={24} color="#7C3AED" />,
          bg: "#F3E8FF",
        },
        {
          title: "Team Members",
          value: memberCount || 0,
          icon: <FaUsers size={24} color="#059669" />,
          bg: "#DBEAFE",
        },
        {
          title: "Discussions",
          value: discussionCount || 0,
          icon: <ImBubbles size={24} color="#EA580C" />,
          bg: "#FFEDD5",
        },
      ].map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          bg={stat.bg}
        />
      ))}
    </section>
  );
};

ProjectStats.propTypes = {
  requirementCount: PropTypes.number,
  diagramCount: PropTypes.number,
  memberCount: PropTypes.number,
  discussionCount: PropTypes.number
}

export default ProjectStats;
