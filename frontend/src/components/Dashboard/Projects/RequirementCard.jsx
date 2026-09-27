import api from "../../../api.js";
import { useAuth } from "../../../contexts/AuthContext.jsx";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { FaRegComment } from "react-icons/fa";
import { IoTrashOutline } from "react-icons/io5";
import ConfirmationPrompt from "../../../overlays/ConfirmationPrompt.jsx";
import Pill from "../../../utils/Shapes/Pill.jsx";
import PropTypes from "prop-types";
import Message from "../../../overlays/Message.jsx";
import ShowError from "../../../overlays/ShowError.jsx";

const RequirementCard = ({
  data,
  onClick,
  isLast,
  onDelete,
  selectedVersion,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { id } = useParams();
  const { user } = useAuth();

  const handleDelete = (e) => {
    e.stopPropagation();
    if (selectedVersion) {
      setMessage(
        "You cannot delete documents in a version until that version is restored"
      );
      return;
    }

    setShowConfirmation(true);
  };

  const deleteRequirement = async (reqId) => {
    if (selectedVersion) return;
    try {
      const response = await api.delete(`/api/req/${id}/${reqId}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (response.status === 200) {
        onDelete(reqId);
        setMessage("Requirement deleted successfully");
        setErrorMessage("");
        setShowConfirmation(false); 
      } else {
        setErrorMessage(`Deletion failed: ${response.data.message}`);
        setMessage("");
      }
    } catch (error) {
      setErrorMessage(
        `Deletion failed due to ${
          error.response?.data?.message || error.message
        }`
      );
      setMessage("");
    }
  };

  const showDetails = () => {
    if (!showConfirmation) {
      onClick();
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "red";
      case "medium":
        return "yellow";
      case "low":
        return "green";
      default:
        return "gray";
    }
  };

  return (
    <div
      className={`bg-white dark:bg-transparent cursor-pointer py-4 flex justify-between items-center ${
        isLast ? "" : "border-b border-[#C5C5C5]"
      }`}
      onClick={showDetails}
    >
      <div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">
          {data.reqId}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{data.title}</p>
        <p className="text-xs text-gray-400 pl-3 mt-3 flex gap-2">
          <FaRegComment size={16} opacity={"60%"} />
          {data.comments?.length || 0} Comments
        </p>
      </div>
      <div className="flex flex-col items-center space-y-3 sm:flex-row sm:justify-normal sm:space-y-0 sm:items-center sm:space-x-3">
        <Pill
          Text={data.priority}
          Color={getPriorityColor(data.priority)}
          className={"text-center"}
        />
        <IoTrashOutline
          className="cursor-pointer"
          size={24}
          color="#dc2626"
          onClick={handleDelete}
        />
      </div>

      {showConfirmation && (
        <ConfirmationPrompt
          text={`Are you sure you want to delete the requirement: "${data.title}"?`}
          onConfirm={() => deleteRequirement(data._id)}
          onCancel={() => setShowConfirmation(false)}
          onConfirmClassName={"bg-red-500 hover:bg-red-600"}
        />
      )}
      {message && <Message text={message} onClose={() => setMessage("")} />}

      {errorMessage && (
        <ShowError text={errorMessage} onClose={() => setErrorMessage("")} />
      )}
    </div>
  );
};
RequirementCard.propTypes = {
  data: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  isLast: PropTypes.bool,
  onDelete: PropTypes.func.isRequired,
};

export default RequirementCard;
