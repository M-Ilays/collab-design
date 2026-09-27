import { useEffect, useState } from "react";
import H4 from "../../utils/Headings/H4.jsx";
import FormField from "./FormField.jsx";
import SelectField from "./SelectField.jsx";
import FormTextArea from "./FormTextArea.jsx";
import PrimaryButton from "../../utils/Buttons/PrimaryButton.jsx";
import PropTypes from "prop-types";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import Message from "../../overlays/Message.jsx";
import ShowError from "../../overlays/ShowError.jsx";
import { FaTimes } from "react-icons/fa";
import AttachmentUploader from "./AttachmentUploader.jsx";

const RequirementForm = ({ onUpdate, initialFormData, isEditMode = false }) => {
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    // Initialize with default empty values
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
    ...initialFormData, // Override with initialFormData
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id: projectId, reqId } = useParams();

  const handleRemoveAttachment = (indexToRemove) => {
    const updatedAttachments = formData.attachments.filter(
      (_, index) => index !== indexToRemove
    );
    handleChange("attachments", updatedAttachments);
  };

  console.log("form data currently:", formData);

  // Sync with parent component's data
  useEffect(() => {
    if (initialFormData) {
      // Ensure all array fields are properly initialized
      const formattedData = {
        ...initialFormData,
        actor: Array.isArray(initialFormData.actor)
          ? initialFormData.actor
          : [],
        assignee: Array.isArray(initialFormData.assignee)
          ? initialFormData.assignee
          : [],
        stakeholders: Array.isArray(initialFormData.stakeholders)
          ? initialFormData.stakeholders
          : [],
        dependencies: Array.isArray(initialFormData.dependencies)
          ? initialFormData.dependencies
          : [],
        attachments: Array.isArray(initialFormData.attachments)
          ? initialFormData.attachments
          : [],
      };
      setFormData(formattedData);
    }
  }, [initialFormData]);

  const formFields = [
    {
      id: "reqId",
      label: "Requirement ID",
      placeholder: "e.g., REQ-001",
      isTagInput: false,
      required: true,
    },
    {
      id: "title",
      label: "Title",
      placeholder: "Enter requirement title",
      isTagInput: false,
      required: true,
    },
    {
      id: "actor",
      label: "Actor",
      placeholder: "e.g., User, Admin",
      isTagInput: true,
      required: true,
    },
    {
      id: "assignee",
      label: "Assignee",
      placeholder: "Person or team responsible",
      isTagInput: true,
      required: true,
    },
    {
      id: "stakeholders",
      label: "Stakeholders",
      placeholder: "List of stakeholders",
      isTagInput: true,
      required: true,
    },
    {
      id: "dependencies",
      label: "Dependencies",
      placeholder: "Related requirements or features",
      isTagInput: true,
      required: false,
    },
    {
      id: "targetRelease",
      label: "Target Release",
      placeholder: "Version or milestone",
      isTagInput: false,
      required: true,
    },
  ];

  const selectFields = [
    {
      id: "category",
      label: "Category",
      placeholder: "Select category",
      required: true,
      options: [
        { label: "Functional", value: "functional" },
        { label: "Non-Functional", value: "non_functional" },
      ],
    },
    {
      id: "priority",
      label: "Priority",
      placeholder: "Select priority",
      required: true,
      options: [
        { label: "High", value: "high" },
        { label: "Medium", value: "medium" },
        { label: "Low", value: "low" },
      ],
    },
    {
      id: "status",
      label: "Status",
      placeholder: "Select status",
      required: true,
      options: [
        { label: "Not Started", value: "not_started" },
        { label: "In Progress", value: "in_progress" },
        { label: "Completed", value: "completed" },
        { label: "On Hold", value: "on_hold" },
      ],
    },
  ];

  const textAreas = [
    {
      id: "description",
      label: "Description",
      placeholder: "Describe the requirement",
      required: true,
    },
    {
      id: "acceptanceCriteria",
      label: "Acceptance Criteria",
      placeholder: "Conditions to be met for acceptance",
      required: true,
    },
  ];

  // In RequirementForm.jsx
  const handleChange = (id, value) => {
    let updatedValue = value;

    // Handle array fields conversion from string to array
    if (["actor", "assignee", "stakeholders", "dependencies"].includes(id)) {
      if (typeof value === "string") {
        updatedValue = value
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== "");
      }
    }

    const updatedData = { ...formData, [id]: updatedValue };
    setFormData(updatedData);
    onUpdate(id, updatedValue);
    setErrors((prev) => ({ ...prev, [id]: null }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Check all required fields
    [...formFields, ...selectFields, ...textAreas].forEach((field) => {
      if (field.required) {
        const value = formData[field.id];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          newErrors[field.id] = `${field.label} is required.`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();

      // Handle regular fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "attachments" && value !== undefined) {
          if (Array.isArray(value)) {
            // For comments, ensure proper structure
            if (key === "comments") {
              formDataToSend.append(key, JSON.stringify(value));
            } else {
              formDataToSend.append(key, JSON.stringify(value));
            }
          } else {
            formDataToSend.append(key, value);
          }
        }
      });

      // Separate existing and new attachments
      const existingAttachments = formData.attachments
        .filter((file) => !(file instanceof File))
        .map((file) => ({
          filename: file.filename,
          filepath: file.filepath,
        }));

      const newAttachments = formData.attachments.filter(
        (file) => file instanceof File
      );

      // Add existing attachments metadata
      formDataToSend.append(
        "existingAttachments",
        JSON.stringify(existingAttachments)
      );

      // Add new attachment files
      newAttachments.forEach((file) => {
        formDataToSend.append("attachments", file);
      });

      // Determine endpoint and method
      const endpoint = isEditMode
        ? `/api/req/${projectId}/requirements/${reqId}`
        : `/api/req/${projectId}/newReq`;

      const method = isEditMode ? "put" : "post";

      const response = await api[method](endpoint, formDataToSend, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        setSuccessMessage(
          isEditMode
            ? "Requirement updated successfully!"
            : "Requirement created successfully!"
        );
        // setTimeout(() => navigate(-1), 1500);
      }
    } catch (error) {
      console.error("Error saving requirement:", error);
      setErrorMessage(
        error.response?.data?.message || error.message || "An error occurred"
      );
    }
  };

  const handleCloseSuccess = () => {
    navigate(-1);
    setSuccessMessage("");
  };
  const handleCloseError = () => {
    navigate(-1);
    setErrorMessage("");
  };

  return (
    <form
      className="flex flex-col p-2 my-2 mx-10 dark:bg-dark-900 w-full max-h-[100dvh] overflow-y-scroll scrollbar-hidden"
      onSubmit={(e) => e.preventDefault()}
    >
      <H4 text={isEditMode ? "Edit Requirement" : "Add New Requirement"} />
      {/* Form Fields */}
      {formFields.map((formField) => (
        <FormField
          key={formField.id}
          id={formField.id}
          placeholder={formField.placeholder}
          title={formField.label}
          isTagInput={formField.isTagInput}
          onChange={(e) => handleChange(formField.id, e.target.value)}
          value={formData[formField.id] || ""}
          error={errors[formField.id]}
        />
      ))}
      {/* Select Fields */}
      {selectFields.map((selectField) => (
        <SelectField
          key={selectField.id}
          id={selectField.id}
          title={selectField.label}
          options={selectField.options}
          onChange={(e) => handleChange(selectField.id, e.target.value)}
          value={formData[selectField.id] || ""}
          error={errors[selectField.id]}
        />
      ))}
      {/* Text Areas */}
      {textAreas.map((textArea) => (
        <FormTextArea
          key={textArea.id}
          id={textArea.id}
          title={textArea.label}
          ariaLabel={textArea.placeholder}
          onChange={(e) => handleChange(textArea.id, e.target.value)}
          value={formData[textArea.id] || ""}
          error={errors[textArea.id]}
        />
      ))}
      {/* Attachments */}

      <AttachmentUploader
        attachments={formData.attachments}
        onChange={(updated) => handleChange("attachments", updated)}
        onRemove={handleRemoveAttachment}
      />
      <PrimaryButton
        action={handleSave}
        text={"Save Requirement"}
        className={"items-center justify-center w-fit mt-4"}
      />
      {successMessage && (
        <Message text={successMessage} onClose={handleCloseSuccess} />
      )}
      {errorMessage && (
        <ShowError text={errorMessage} onClose={handleCloseError} />
      )}
    </form>
  );
};

RequirementForm.propTypes = {
  onUpdate: PropTypes.func.isRequired,
};

export default RequirementForm;
