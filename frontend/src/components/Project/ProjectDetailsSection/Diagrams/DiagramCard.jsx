import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiFileText, FiEdit2, FiTrash2 } from "react-icons/fi";
import SecondaryInput from "../../../../utils/Inputs/SecondaryInput";
import TextAreas from "../../../../utils/Inputs/TextAreas";
import PrimaryButton from "../../../../utils/Buttons/PrimaryButton";
import PrimaryModal from "../../../../utils/Modals/PrimaryModal";
import api from "../../../../api";
import { useAuth } from "../../../../contexts/AuthContext";
import ConfirmationPrompt from "../../../../overlays/ConfirmationPrompt";
import { useLocation } from "react-router-dom";
import Message from "../../../../overlays/Message";

const DiagramCard = ({
  selectedVersion,
  id,
  name,
  description,
  refreshDiagrams,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();

  const [localName, setLocalName] = useState(name);
  const [localDescription, setLocalDescription] = useState(description);

  useEffect(() => {
    setLocalName(name);
    setLocalDescription(description);
  }, [name, description]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editDescription, setEditDescription] = useState(description);
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);
  const [message, setMessage] = useState("");

  const handleCardClick = (e) => {
    if (e.target.closest(".action-btn")) return;
    if (!selectedVersion) navigate(`canvas/${id}`, { relative: "path" });
    else navigate(`canvas/${id}/${selectedVersion._id}`, { relative: "path" });
  };

  const handleEdit = () => {
    if (selectedVersion) {
      setMessage(
        "You cannot edit documents in a version until that version is restored"
      );
      return;
    }
    setEditName(localName);
    setEditDescription(localDescription);
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    try {
      await api.put(
        `/api/diagram/edit/${id}`,
        { name: editName, description: editDescription },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      setShowEditModal(false);
      // 3) ask parent to re-fetch
      await refreshDiagrams();
    } catch (err) {
      console.error("Failed to edit diagram", err);
    }
  };

  // const handleDelete = async () => {
  //   if (!window.confirm("Are you sure?")) return;
  //   try {
  //     await api.delete(`/api/diagram/delete/${id}`, {
  //       headers: { Authorization: `Bearer ${user?.token}` },
  //     });
  //     await refreshDiagrams();
  //   } catch (err) {
  //     console.error("Failed to delete diagram", err);
  //   }
  // };

  return (
    <>
      {message && <Message text={message} onClose={() => setMessage("")} />}
      <div
        onClick={handleCardClick}
        className="
          relative p-5 border border-gray-200 dark:border-gray-700
          rounded-xl shadow-md dark:shadow-none
          bg-white dark:bg-gray-800
          hover:shadow-lg dark:hover:shadow-xl
          transition duration-300 cursor-pointer group
        "
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <FiFileText
              size={28}
              className="text-indigo-500 dark:text-indigo-400"
            />
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {localName}
            </h3>
          </div>
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition">
            <button
              className="action-btn p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
              title="Edit"
            >
              <FiEdit2 className="text-gray-600 dark:text-gray-300" />
            </button>
            <button
              className="action-btn p-2 rounded-full hover:bg-gray-100 dark:hover:bg-red-700 transition"
              onClick={(e) => {
                e.stopPropagation();
                if (selectedVersion) {
                  setMessage(
                    "You cannot delete documents in a version until that version is restored"
                  );
                  return;
                }
                setShowDeletePrompt(true);
                // handleDelete();
              }}
              title="Delete"
            >
              <FiTrash2 className="text-red-500 dark:text-red-400" />
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
          {localDescription || (
            <span className="italic text-gray-400 dark:text-gray-500">
              No description provided.
            </span>
          )}
        </div>
      </div>

      {showDeletePrompt && (
        <ConfirmationPrompt
          text="This will permanently delete the diagram. Are you sure?"
          onConfirm={async () => {
            setShowDeletePrompt(false);

            const pathParts = location.pathname.split("/");
            const projectId = pathParts[2];
            try {
              await api.delete(`/api/diagram/${projectId}/${id}`, {
                headers: { Authorization: `Bearer ${user?.token}` },
              });
              await refreshDiagrams();
            } catch (err) {
              console.error("Failed to delete diagram", err);
            }
          }}
          onCancel={() => setShowDeletePrompt(false)}
          onConfirmClassName="bg-red-600 hover:bg-red-700"
        />
      )}

      {showEditModal && (
        <PrimaryModal
          onClose={() => setShowEditModal(false)}
          heading="Edit Diagram"
          buttonText="Save Changes"
          onSubmit={handleEditSave}
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                Diagram Name
              </label>
              <SecondaryInput
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeHolder="Enter diagram name"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                Description
              </label>
              <TextAreas
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeHolder="Description..."
                className="w-full"
              />
            </div>
          </div>
        </PrimaryModal>
      )}
    </>
  );
};

export default DiagramCard;
