import H4 from "../../utils/Headings/H4.jsx";
import PropTypes from "prop-types";
import ReqCard from "./ReqCard.jsx";

const RequirementDetails = ({ requirements }) => {
  // Separate requirements into those with and without reqId
  const existingRequirements = requirements.filter((req) => req.reqId);
  const newRequirements = requirements.filter((req) => !req.reqId);

  // Combine them to display existing ones first
  const sortedRequirements = [...existingRequirements, ...newRequirements];

  return (
    <div
      className={
        "hidden md:flex flex-col p-6 my-4 mx-10 dark:bg-dark-50 shadow-2xl w-full rounded-lg border scrollbar-hidden max-h-[100dvh] overflow-y-scroll"
      }
    >
      <H4 text={"Requirement Details"} className={"text-primary mb-6"} />

      {sortedRequirements.map((requirement, index) => {
        const isEditable = !requirement._id; // New requirement (no reqId) is editable

        return (
          <div key={index} className="mb-4">
            <ReqCard details={requirement} isEditable={isEditable} />
          </div>
        );
      })}
    </div>
  );
};

RequirementDetails.propTypes = {
  requirements: PropTypes.arrayOf(
    PropTypes.shape({
      reqId: PropTypes.string, // Determines if it's a new or existing requirement
      title: PropTypes.string,
      description: PropTypes.string,
      actor: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
      ]),
      assignee: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
      ]),
      stakeholders: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
      ]),
      dependencies: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
      ]),
      targetRelease: PropTypes.string,
      category: PropTypes.string,
      priority: PropTypes.string,
      status: PropTypes.string,
      acceptanceCriteria: PropTypes.string,
      attachments: PropTypes.array,
    })
  ).isRequired,
};

export default RequirementDetails;
