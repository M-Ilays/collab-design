import { IoTrashOutline } from "react-icons/io5";
import Message from "../../../overlays/Message.jsx";
import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext.jsx";
import api from "../../../api.js";
import ConfirmationPrompt from "../../../overlays/ConfirmationPrompt.jsx";

const TeamMemberCard = ({
  Name,
  IsOwner,
  isLast,
  MemberId,
  projectId,
  OwnerId,
  refreshProject,
}) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState("");
  const { user } = useAuth();
  const ownerUser = user.id === OwnerId;

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      const response = await api.put(
        "/api/project/remove-member",
        {
          projectId,
          memberId: MemberId,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setShowPrompt(false);

      if (response.data.success) {
        setMessageText("The team member has been removed");
        //
      } else {
        setMessageText("Failed to remove the member: " + response.data.message);
      }
    } catch (error) {
      console.error("Error removing member:", error);
      setMessageText("An error occurred while removing the member.");
    } finally {
      setIsProcessing(false);
      // Use setTimeout to ensure state updates are processed before showing message
      setTimeout(() => setShowMessage(true), 0);
    }
  };

  return (
    <>
      {/* Render Message as a portal at the root level */}
      {showMessage && (
        <Message
          text={messageText}
          onClose={() => {
            setShowMessage(false);
            refreshProject();
          }}
        />
      )}

      <div
        className={`bg-white dark:bg-dark px-4 py-3 flex justify-between items-center ${
          isLast ? "" : "border-b border-gray-200"
        }`}
      >
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-white">
            {Name}
          </h3>
          <p className="text-sm text-gray-600 mb-4 dark:text-gray-400">
            {IsOwner ? "Owner" : "Member"}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {!IsOwner && ownerUser && (
            <div>
              <div
                onClick={() => setShowPrompt(true)}
                className="hidden md:block border-2 cursor-pointer rounded-md px-4 py-2 border-[#dc2626] text-[#dc2626] hover:text-red-800 hover:border-red-800 transition-colors duration-300"
              >
                <h3 className="text-base">Remove Member</h3>
              </div>
              <IoTrashOutline
                onClick={() => setShowPrompt(true)}
                className={"block md:hidden"}
                size={24}
                color="#dc2626"
              />
            </div>
          )}
        </div>

        {showPrompt && (
          <ConfirmationPrompt
            text={`Are you sure you want to remove ${Name} from the project?`}
            onConfirm={handleDelete}
            onCancel={() => !isProcessing && setShowPrompt(false)}
            onConfirmClassName="bg-[#dc2626] hover:bg-red-800"
            isProcessing={isProcessing}
          />
        )}
      </div>
    </>
  );
};

export default TeamMemberCard;
