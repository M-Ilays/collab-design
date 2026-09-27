import React, { useState } from "react";
import PrimaryModal from "../../../../utils/Modals/PrimaryModal";
import CommentSection from "../../Requirement/CommentSection";
import TextAreas from "../../../../utils/Inputs/TextAreas";
import PrimaryButton from "../../../../utils/Buttons/PrimaryButton";
import api from "../../../../api";
import { useAuth } from "../../../../contexts/AuthContext";

const DiagramDetailsModal = ({ diagram, onClose, refreshDiagrams }) => {
  const [commentContent, setCommentContent] = useState("");
  const [comments, setComments] = useState(diagram.comments || []);
  const { user } = useAuth();

  const handleAddComment = async () => {
    if (!commentContent.trim()) return;

    try {
      const response = await api.post(
        `/api/diagram/addComment/${diagram._id}`,
        {
          content: commentContent,
          author: user._id,
          type: "normal",
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );

      if (response.data.result) {
        setCommentContent("");
        refreshDiagrams();
      }
    } catch (err) {
      console.error("Error adding comment", err);
    }
  };

  const handleResolve = async (commentId) => {
    try {
      const response = await api.put(
        `/api/diagram/resolveComment/${diagram._id}/${commentId}`,
        {},
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );

      if (response.data.result) {
        refreshDiagrams();
      }
    } catch (err) {
      console.error("Error resolving comment", err);
    }
  };

  return (
    <PrimaryModal
      onClose={onClose}
      heading={diagram.name}
      buttonText={"Close"}
      onSubmit={onClose}
    >
      <div className="flex flex-col gap-4">
        <div className="text-gray-700 dark:text-gray-300">{diagram.description}</div>

        <div className="mt-4">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Comments
          </h4>
          <CommentSection comments={comments} handleResolve={handleResolve} />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddComment();
            }}
            className="mt-3"
          >
            <TextAreas
              id="diagramComment"
              value={commentContent}
              ariaLabel="Add comment"
              onChange={(e) => setCommentContent(e.target.value)}
            />
            <PrimaryButton type="submit" text="+ Add Comment" className="mt-2" />
          </form>
        </div>
      </div>
    </PrimaryModal>
  );
};

export default DiagramDetailsModal;
