import Rectangle from "../../../utils/Shapes/Rectangle.jsx";
import TimeInfo from "./TimeInfo";
import Actors from "./Actors.jsx";
import CommentSection from "./CommentSection";
import FileAttachment from "../../../utils/Attachments/FileAttachment.jsx";
import PrimaryButton from "../../../utils/Buttons/PrimaryButton.jsx";
import PropTypes from "prop-types";
import { FaRegEdit } from "react-icons/fa";
import H4 from "../../../utils/Headings/H4.jsx";
import TextAreas from "../../../utils/Inputs/TextAreas.jsx";
import api from "../../../api.js";
import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext.jsx";
import { useNavigate, useParams } from "react-router-dom";
import Message from "../../../overlays/Message.jsx";

const RequirementDetails = ({
  selectedVersion,
  data,
  refreshProject,
  requirements,
  projectStatus,
  projectName,
}) => {
  const { user } = useAuth();
  const [commentContent, setCommentContent] = useState("");
  const [comments, setComments] = useState(data.comments || []);
  const [message, setMessage] = useState("");
  console.log("requirement data", data);
  const { id: projectId } = useParams(); // Get project ID from URL
  const navigate = useNavigate();

  const handleEditClick = () => {
    if (selectedVersion) {
      setMessage(
        "You cannot edit documents in a version until that version is restored"
      );
      return;
    }
    navigate(`/project/${projectId}/EditReq/${data._id}`, {
      state: { requirements, projectName, projectStatus },
    });
  };

  useEffect(() => {
    setComments(data.comments);
  }, [data]);

  // Move handleResolve to the parent
  const handleResolve = async (commentId) => {
    if (!commentId) {
      console.error("No comment ID provided");
      return;
    }

    try {
      // Optimistically update UI first
      const updatedComments = comments.map((comment) =>
        comment._id === commentId ? { ...comment, type: "highlight" } : comment
      );

      setComments(updatedComments); // Update state with the new comment state

      // Then send API request
      const response = await api.put(
        `/api/req/${data._id}/resolveComment/${commentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      refreshProject();
    } catch (error) {
      console.error("Error resolving comment:", error);
    }
  };

  const handleComment = async () => {
    if (!commentContent.trim()) {
      return;
    }

    try {
      const response = await api.post(
        `/api/req/${data._id}/addComment`,
        {
          author: user._id,
          content: commentContent,
          type: "normal",
        },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      const { result, message } = response.data;

      if (result) {
        setCommentContent(""); // Clear comment input
        refreshProject(); // Refresh project details (includes comments)
        console.log("Comment added successfully!");
      } else {
        console.error("Failed to add comment:", message);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <>
      {message && <Message text={message} onClose={() => setMessage("")} />}
      <div className="flex flex-col bg-white rounded-lg shadow-sm pb-12 dark:bg-dark-900">
        <div className="flex flex-wrap justify-between px-6 py-8 border-b border-slate-200">
          <div className="flex flex-col leading-8">
            <div className="text-xs font-medium text-primary-subtitle dark:text-gray-400">
              {data.reqId}
            </div>
            <div className="mt-2 text-2xl font-bold text-primary">
              {data.title}
            </div>
            <div className="flex flex-wrap gap-4 mt-3.5 mb-2 text-sm">
              <Rectangle text={data.priority} index={0} />
              <Rectangle text={data.status} index={1} />
              <Rectangle text={data.category} index={2} />
            </div>
          </div>
          <div className="flex flex-col md:items-end mt-2 md:mt-0 gap-4">
            <TimeInfo
              createdDate={new Date(data.createdAt).toLocaleDateString()}
              updatedDate={new Date(data.updatedAt).toLocaleDateString()}
            />
            <FaRegEdit
              onClick={handleEditClick}
              className="text-primary-subtitle hover:text-primary-heading dark:text-gray-400 cursor-pointer"
            />
          </div>
        </div>

        <div className="px-6 mt-5">
          <H4 text={"Description"} />
          <div className="text-primary-subtitle dark:text-gray-400">
            {data.description}
          </div>

          <div className="flex flex-wrap justify-between gap-y-5 my-2 p-2">
            <Actors
              title="Actors"
              actors={data.actor}
              className="flex-1 min-w-[30%]"
            />
            <Actors
              title="Stakeholders"
              actors={data.stakeholders}
              className="flex-1 min-w-[30%]"
            />
            <Actors
              title="Assignee"
              actors={data.assignee}
              className="flex-1 min-w-[30%]"
            />
          </div>

          <H4 text={"Target Release"} />
          <div className="text-primary-subtitle dark:text-gray-400">
            {data.targetRelease}
          </div>

          <H4 text={"Acceptance Criteria"} />
          <div className="text-primary-subtitle dark:text-gray-400">
            {data.acceptanceCriteria}
          </div>
          {data.dependencies.length > 0 && (
            <>
              <H4 text={"Dependencies"} />
              <div className="text-primary-subtitle dark:text-gray-400">
              {data.dependencies.map(dep => dep.toUpperCase()).join(', ')}

              </div>
            </>
          )}

          {data.attachments.length > 0 && (
            <div>
              <H4 text={"Attachments"} />
              <div className="flex flex-wrap gap-4 mt-2.5 text-center text-primary-subtitle ">
                {data.attachments?.map((attachment, index) => (
                  <FileAttachment
                    key={index}
                    fileName={attachment.filename}
                    filePath={attachment.filepath}
                  />
                ))}
              </div>
            </div>
          )}
          {data.comments && (
            <div>
              <H4 text={"Comments"} />
              <CommentSection
                requirementId={data._id}
                comments={comments}
                handleResolve={handleResolve}
              />
            </div>
          )}

          <H4 text={"Add Comment"} />
          <form
            className="w-full"
            onSubmit={(e) => {
              e.preventDefault();
              handleComment();
            }}
          >
            <TextAreas
              id={"commentId"}
              ariaLabel={"Add your comment"}
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
            />
            <PrimaryButton
              action={() => {}}
              type="submit"
              text="+ Add comment"
              className="mt-3"
            />
          </form>
        </div>
      </div>
    </>
  );
};

RequirementDetails.propTypes = {
  data: PropTypes.object.isRequired,
};

export default RequirementDetails;
