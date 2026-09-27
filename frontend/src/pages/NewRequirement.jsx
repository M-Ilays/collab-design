import ProjectHeader from "../components/Project/ProjectHeader.jsx";
import RequirementForm from "../components/NewReq/RequirementForm.jsx";
import RequirementDetails from "../components/NewReq/RequirementDetails.jsx";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

const NewRequirement = () => {
  const { reqId } = useParams();
  const location = useLocation();
  const [formData, setFormData] = useState({
    reqId: "",
    title: "",
    actor: [],
    assignee: [],
    stakeholders: [],
    dependencies: [],
    targetRelease: "",
    category: "",
    priority: "",
    status: "",
    description: "",
    acceptanceCriteria: "",
    attachments: [],
  });

  // Load existing requirement if in edit mode
  useEffect(() => {
    if (reqId) {
      const existingReq = location.state?.requirements?.find(
        (req) => req._id === reqId
      );
      if (existingReq) {
        setFormData(existingReq);
      }
    }
  }, [reqId, location.state]);

  const handleFormUpdate = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const allRequirements = reqId
    ? location.state?.requirements || []
    : [{ ...formData }, ...(location.state?.requirements || [])];

  return (
    <div className="dark:bg-dark-900">
      <ProjectHeader
        projectName={location.state?.projectName || ""}
        projectStatus={location.state?.projectStatus || ""}
      />
      <div className="flex gap-4 justify-between w-full">
        <RequirementForm
          onUpdate={handleFormUpdate}
          initialFormData={formData}
          isEditMode={!!reqId}
        />
        <RequirementDetails requirements={allRequirements} />
      </div>
    </div>
  );
};

export default NewRequirement;
