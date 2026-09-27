import PrimaryButton from "../../../utils/Buttons/PrimaryButton";
import { IoCloudDownloadOutline } from "react-icons/io5";
import SecondaryInput from "../../../utils/Inputs/SecondaryInput.jsx";
import PropTypes from "prop-types";
import RequirementDetails from "../Requirement/RequirementDetails.jsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosFolderOpen } from "react-icons/io";
import RequirementCard from "../../Dashboard/Projects/RequirementCard.jsx";
import { jsPDF } from "jspdf";
import PrimaryModal from "../../../utils/Modals/PrimaryModal.jsx";

const RequirementsTabDetail = ({
  requirements,
  projectStatus,
  projectName,
  refreshProject,
  handleVersionsClick,
  selectedVersion,
}) => {
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const navigate = useNavigate();
  const [currentRequirements, setCurrentRequirements] = useState(requirements);
  const [searchValue, setSearchValue] = useState("");
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedFields, setSelectedFields] = useState({
    reqId: true,
    title: true,
    description: true,
    actor: true,
    assignee: true,
    stakeholders: true,
    dependencies: true,
    priority: true,
    status: true,
    category: true,
    targetRelease: true,
    acceptanceCriteria: true,
    attachments: true,
    comments: true,
  });

  const toggleFieldSelection = (field) => {
    setSelectedFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const toggleAllFields = (selectAll) => {
    const newState = {};
    Object.keys(selectedFields).forEach((field) => {
      newState[field] = selectAll;
    });
    setSelectedFields(newState);
  };

  useEffect(() => {
    if (selectedRequirement) {
      const updatedReq = requirements.find(
        (req) => req._id === selectedRequirement._id
      );
      if (updatedReq) setSelectedRequirement(updatedReq);
    }
    setCurrentRequirements(requirements);
  }, [requirements]);

  const handleNewRequirement = () => {
    navigate("NewReq", { state: { requirements, projectStatus, projectName } });
  };
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchValue(value);

    const filteredRequirements = requirements.filter(
      (req) =>
        req.title.toLowerCase().includes(value) ||
        req.description.toLowerCase().includes(value)
    );
    setCurrentRequirements(filteredRequirements);
  };
  const handleDownload = () => {
    const doc = new jsPDF();

    // Heading
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    const pageWidth = doc.internal.pageSize.getWidth();
    const heading = projectName || "Requirements";
    const textWidth = doc.getTextWidth(heading);
    const headingX = (pageWidth - textWidth) / 2;
    doc.text(heading, headingX, 20);
    doc.setDrawColor(0, 0, 0);
    doc.line(10, 25, pageWidth - 10, 25);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);

    let yOffset = 30;
    const pageHeight = doc.internal.pageSize.getHeight();

    // Modified addField function to handle field names consistently
    const addField = (fieldKey, label, value) => {
      if (!selectedFields[fieldKey]) return;

      value = Array.isArray(value) ? value.join(", ") : value || "Not provided";

      doc.setFont("Helvetica", "bold");
      doc.text(`${label}:`, 10, yOffset);
      yOffset += 6;

      doc.setFont("Helvetica", "normal");
      const lines = doc.splitTextToSize(value, pageWidth - 20);
      lines.forEach((line) => {
        doc.text(line, 15, yOffset);
        yOffset += 6;

        if (yOffset > pageHeight - 20) {
          doc.addPage();
          yOffset = 20;
        }
      });
    };

    requirements.forEach((requirement, index) => {
      if (yOffset > pageHeight - 40) {
        doc.addPage();
        yOffset = 20;
      }

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.text(`Requirement ${index + 1}`, 10, yOffset);
      yOffset += 10;

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(12);

      // Use consistent field keys that match the state keys
      if (selectedFields.reqId) addField("reqId", "Req ID", requirement.reqId);
      if (selectedFields.title) addField("title", "Title", requirement.title);
      if (selectedFields.description)
        addField("description", "Description", requirement.description);
      if (selectedFields.actor) addField("actor", "Actor", requirement.actor);
      if (selectedFields.assignee)
        addField("assignee", "Assignee", requirement.assignee);
      if (selectedFields.stakeholders)
        addField("stakeholders", "Stakeholders", requirement.stakeholders);
      if (selectedFields.dependencies)
        addField("dependencies", "Dependencies", requirement.dependencies);
      if (selectedFields.priority)
        addField("priority", "Priority", requirement.priority);
      if (selectedFields.status)
        addField("status", "Status", requirement.status);
      if (selectedFields.category)
        addField("category", "Category", requirement.category);
      if (selectedFields.targetRelease)
        addField("targetRelease", "Target Release", requirement.targetRelease);
      if (selectedFields.acceptanceCriteria)
        addField(
          "acceptanceCriteria",
          "Acceptance Criteria",
          requirement.acceptanceCriteria
        );

      if (selectedFields.attachments && requirement.attachments?.length > 0) {
        doc.setFont("Helvetica", "bold");
        doc.text("Attachments:", 10, yOffset);
        yOffset += 6;

        doc.setFont("Helvetica", "normal");
        requirement.attachments.forEach((attachment) => {
          const attachmentName = attachment.filename || "Unnamed File";
          doc.text(`- ${attachmentName}`, 15, yOffset);
          yOffset += 6;

          if (yOffset > pageHeight - 20) {
            doc.addPage();
            yOffset = 20;
          }
        });
      }

      if (selectedFields.comments && requirement.comments?.length > 0) {
        doc.setFont("Helvetica", "bold");
        doc.text("Comments:", 10, yOffset);
        yOffset += 6;

        doc.setFont("Helvetica", "normal");
        requirement.comments.forEach((comment) => {
          const commentText = `${
            comment.author?.name || "Anonymous"
          } (${new Date(comment.time).toLocaleString()}): ${comment.content}`;
          const lines = doc.splitTextToSize(commentText, pageWidth - 20);
          lines.forEach((line) => {
            doc.text(line, 15, yOffset);
            yOffset += 6;

            if (yOffset > pageHeight - 20) {
              doc.addPage();
              yOffset = 20;
            }
          });
        });
      }

      yOffset += 6;
      if (yOffset < pageHeight - 20) {
        doc.setDrawColor(200, 200, 200);
        doc.line(10, yOffset, pageWidth - 10, yOffset);
        yOffset += 10;
      }
    });

    doc.save(`${projectName}-SRS.pdf`);
    setShowDownloadModal(false);
  };

  const handleCloseDownloadModal = () => {
    setShowDownloadModal(false);
    // Reset all fields to true when modal is closed
    toggleAllFields(true);
  };

  const renderDownloadModal = () => (
    <PrimaryModal
      onClose={handleCloseDownloadModal}
      heading="Select Fields to Include"
      buttonText="Download"
      onSubmit={handleDownload}
    >
      <div className="space-y-4">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="selectAll"
            checked={Object.values(selectedFields).every(Boolean)}
            onChange={(e) => toggleAllFields(e.target.checked)}
            className="h-5 w-5 accent-[#764BA2] rounded border-gray-300 focus:ring-purple-500"
            style={{ color: "#764BA2" }} // Purple-600
          />
          <label
            htmlFor="selectAll"
            className="ml-3 text-gray-700 dark:text-gray-300 font-medium"
          >
            Select All Fields
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {Object.entries({
            reqId: "Requirement ID",
            title: "Title",
            description: "Description",
            actor: "Actor",
            assignee: "Assignee",
            stakeholders: "Stakeholders",
            dependencies: "Dependencies",
            priority: "Priority",
            status: "Status",
            category: "Category",
            targetRelease: "Target Release",
            acceptanceCriteria: "Acceptance Criteria",
            attachments: "Attachments",
            comments: "Comments",
          }).map(([field, label]) => (
            <div key={field} className="flex items-center">
              <input
                type="checkbox"
                id={`field-${field}`}
                checked={selectedFields[field]}
                onChange={() => toggleFieldSelection(field)}
                className="h-5 w-5 accent-[#764BA2] rounded border-gray-300 focus:ring-purple-500"
                style={{ color: "#764BA2" }} // Purple-600
              />
              <label
                htmlFor={`field-${field}`}
                className="ml-3 text-gray-700 dark:text-gray-300"
              >
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </PrimaryModal>
  );

  const handleDownloadClick = () => {
    setShowDownloadModal(true);
  };

  const handleDeleteRequirement = (reqId) => {
    setCurrentRequirements(
      currentRequirements.filter((requirement) => requirement._id !== reqId)
    );
    if (typeof refreshProject === 'function') {
      refreshProject();
    }
  };

  return (
    <section className=" pt-6 rounded-md bg-white dark:bg-dark px-4  ">
      <div className="hidden md:flex justify-between items-center mb-4">
        <div style={{ minWidth: '160px' }}>
          {projectStatus == "Active" && (!selectedVersion) ? (
            <PrimaryButton
              text={"+ New Requirement"}
              action={handleNewRequirement}
            />
          ) : (
            <div />
          )}
        </div>
        <div className="flex  items-center space-x-3">
          <PrimaryButton text={"Versions"} action={handleVersionsClick} />

          {requirements.length > 0 && (
            <IoCloudDownloadOutline
              size={24}
              color="#764ba2"
              onClick={handleDownloadClick}
            />
          )}
          <SecondaryInput
            placeHolder={"Search requirements..."}
            value={searchValue}
            onChange={handleSearch}
          />
        </div>
      </div>
      {showDownloadModal && renderDownloadModal()}

      <div className="flex flex-col gap-y-3 mb-4 md:hidden">
        <SecondaryInput
          placeHolder={"Search requirements..."}
          value={searchValue}
          onChange={handleSearch}
        />
        <div className="flex items-center gap-3">
          {(!selectedVersion) && (
            <PrimaryButton text={"+"} action={handleNewRequirement} />
          )}
          <PrimaryButton text={"Versions"} action={handleVersionsClick} />
          {requirements.length > 0 && (
            <IoCloudDownloadOutline
              size={24}
              color="#764ba2"
              onClick={handleDownloadClick}
            />
          )}
        </div>
      </div>

      {currentRequirements.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <IoIosFolderOpen size={48} color="#C5C5C5" />
          <p className="text-lg text-gray-500">No requirements available</p>
        </div>
      ) : (
        <div className="space-y-4 px-4">
          {currentRequirements.map((requirement, index) => (
            <RequirementCard
              selectedVersion={selectedVersion}
              key={index}
              data={requirement}
              onClick={() => setSelectedRequirement(requirement)}
              isLast={index === currentRequirements.length - 1}
              onDelete={handleDeleteRequirement}
            />
          ))}
        </div>
      )}

      {/* Modal Overlay */}
      {selectedRequirement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 "
          onClick={() => setSelectedRequirement(null)}
        >
          <div
            className=" rounded-lg shadow-lg max-w-3xl w-[80%] md:w-[90%] max-h-[60%] lg:max-h-[80%]  overflow-y-auto scrollbar-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <RequirementDetails
              selectedVersion={selectedVersion}
              refreshProject={refreshProject}
              data={selectedRequirement}
              requirements={requirements}
              projectStatus={projectStatus}
              projectName={projectName}
            />
          </div>
        </div>
      )}
    </section>
  );
};

RequirementsTabDetail.propTypes = {
  requirements: PropTypes.array.isRequired,
  projectName: PropTypes.string.isRequired,
  projectStatus: PropTypes.string.isRequired,
};

export default RequirementsTabDetail;
