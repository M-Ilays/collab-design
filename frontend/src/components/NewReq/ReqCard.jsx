import FileAttachment from "../../utils/Attachments/FileAttachment.jsx";
import PropTypes from "prop-types";

const ReqCard = ({ details, isEditable }) => {
  const formatArrayField = (field) =>
    Array.isArray(field) ? field.join(", ") : field || "Not provided";

  const renderField = (value) => {
    return isEditable ? (
      <input
        type="text"
        value={value || "Not provided"}
        readOnly
        className="w-full text-gray-400 bg-transparent focus:outline-none"
      />
    ) : (
      <p className="text-gray-400">{value || "Not provided"}</p>
    );
  };

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-4 ${
        isEditable ? "shadow-xl rounded-lg" : "shadow-none rounded-0"
      }`}
    >
      {/* Req ID, Title, and Description */}
      <div className="px-2 col-span-1 md:col-span-2">
        <h5 className="font-bold text-gray-500">Req ID</h5>
        {renderField(details.reqId)}
        <h5 className="font-bold text-gray-500 mt-4">Title</h5>
        {renderField(details.title)}
        <h5 className="font-bold text-gray-500 mt-4">Description</h5>
        {renderField(details.description)}
      </div>

      {/* Actors, Assignees, and Stakeholders */}
      <div className="px-2">
        <h5 className="font-bold text-gray-500">Actor</h5>
        {renderField(formatArrayField(details.actor))}
        <h5 className="font-bold text-gray-500 mt-4">Assignee</h5>
        {renderField(formatArrayField(details.assignee))}
        <h5 className="font-bold text-gray-500 mt-4">Stakeholders</h5>
        {renderField(formatArrayField(details.stakeholders))}
      </div>

      {/* Dependencies, Priority, and Status */}
      <div className="px-2">
        <h5 className="font-bold text-gray-500">Dependencies</h5>
        {renderField(formatArrayField(details.dependencies))}
        <h5 className="font-bold text-gray-500 mt-4">Priority</h5>
        {renderField(details.priority)}
        <h5 className="font-bold text-gray-500 mt-4">Status</h5>
        {renderField(details.status)}
      </div>

      {/* Category, Target Release, and Acceptance Criteria */}
      <div className="px-2 col-span-1 md:col-span-2">
        <h5 className="font-bold text-gray-500">Category</h5>
        {renderField(details.category)}
        <h5 className="font-bold text-gray-500 mt-4">Target Release</h5>
        {renderField(details.targetRelease)}
        <h5 className="font-bold text-gray-500 mt-4">Acceptance Criteria</h5>
        {renderField(details.acceptanceCriteria)}
      </div>

      {/* Attachments */}
      <div className="col-span-1 md:col-span-2 px-2">
        <h5 className="font-bold text-gray-500">Attachments</h5>
        <div className="space-y-2">
          {details.attachments && details.attachments.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {details.attachments &&
                details.attachments.map((file, index) => {
                  if (file instanceof File) {
                    const fileURL = URL.createObjectURL(file);
                    return (
                      <a
                        key={index}
                        href={fileURL}
                        download={file.name}
                        className="no-underline"
                      >
                        <FileAttachment
                          fileName={file.name}
                          className="cursor-pointer hover:shadow-md"
                        />
                      </a>
                    );
                  } else {
                    console.error("Invalid file format:", file);
                    return null; // Skip invalid files
                  }
                })}
            </div>
          ) : (
            <p className="text-gray-400">No attachments uploaded</p>
          )}
        </div>
      </div>
      {!isEditable && (
        <hr className="my-2 w-full border-gray-300 col-span-full" />
      )}
    </div>
  );
};

ReqCard.propTypes = {
  details: PropTypes.shape({
    reqId: PropTypes.string,
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
  }).isRequired,
  isEditable: PropTypes.bool, // Determines if the card is editable
};

export default ReqCard;
