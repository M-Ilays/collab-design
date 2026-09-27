import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  MoreVertical,
  Eye,
  MessageSquare,
  ArrowUp,
  Flag,
  Trash,
  Lock,
  Unlock,
  ChevronDown,
} from "lucide-react";
import PrimaryModal from "../../utils/Modals/PrimaryModal";
import TextAreas from "../../utils/Inputs/TextAreas";

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return `${interval} year${interval > 1 ? "s" : ""} ago`;
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `${interval} month${interval > 1 ? "s" : ""} ago`;
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `${interval} day${interval > 1 ? "s" : ""} ago`;
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `${interval} hour${interval > 1 ? "s" : ""} ago`;
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `${interval} minute${interval > 1 ? "s" : ""} ago`;
  return "Just now";
};

const ThreadCard = ({
  author,
  createdAt,
  title,
  content,
  tags,
  views,
  comments = [],
  likes = [],
  status,
  _id,
  activeTab,
  onDelete,
  onToggleStatus,
}) => {
  const { user } = useAuth();
  const isAuthor = user && author?._id === user.id;
  const [showDropdown, setShowDropdown] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportReasons, setReportReasons] = useState({
    spam: false,
    harassment: false,
    inappropriate: false,
    misinformation: false,
    other: false,
  });

  const handleDropdownToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(_id);
    setShowDropdown(false);
  };

  const handleToggleStatus = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleStatus(_id);
    setShowDropdown(false);
  };

  const handleReport = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowReportModal(true);
    setShowDropdown(false);
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();

    // Validate that at least one reason is selected
    const isReasonSelected = Object.values(reportReasons).some(Boolean);
    if (!isReasonSelected) {
      setValidationError("Please select at least one reason");
      return;
    }

    // Clear validation error if present
    setValidationError("");

    // Here you would typically send the report to your backend
    // For now, we'll just simulate a successful submission
    setReportSubmitted(true);
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setReportSubmitted(false);
    setReportReasons({
      spam: false,
      harassment: false,
      inappropriate: false,
      misinformation: false,
      other: false,
    });
    setReportDetails("");
    setValidationError("");
  };

  const handleReasonChange = (reason) => {
    setReportReasons((prev) => ({
      ...prev,
      [reason]: !prev[reason],
    }));
  };

  // Truncate content for preview
  const truncatedContent =
    content?.length > 180 ? content.substring(0, 180) + "..." : content;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200">
      {/* Status indicator for closed threads */}
      {showReportModal && (
        <PrimaryModal
          onClose={handleCloseReportModal}
          heading={reportSubmitted ? "Thank You!" : "Report Thread"}
          buttonText={reportSubmitted ? "Close" : "Submit Report"}
          onSubmit={
            reportSubmitted ? handleCloseReportModal : handleReportSubmit
          }
        >
          {reportSubmitted ? (
            <div className="text-center py-4">
              <p className="text-gray-700 dark:text-gray-300 mb-6 line-clamp-2">
                Thank you for your feedback. Our team will review this thread
                and take appropriate action if necessary.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Please select the reason for reporting this thread:
              </p>

              <div className="space-y-3">
                {[
                  { id: "spam", label: "Spam or misleading content" },
                  { id: "harassment", label: "Harassment or bullying" },
                  { id: "inappropriate", label: "Inappropriate content" },
                  {
                    id: "misinformation",
                    label: "Misinformation or fake news",
                  },
                  { id: "other", label: "Other" },
                ].map((reason) => (
                  <div key={reason.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={reason.id}
                      checked={reportReasons[reason.id]}
                      onChange={() => handleReasonChange(reason.id)}
                      className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <label
                      htmlFor={reason.id}
                      className="ml-3 text-gray-700 dark:text-gray-300"
                    >
                      {reason.label}
                    </label>
                  </div>
                ))}
              </div>

              {validationError && (
                <p className="text-red-500 text-sm mt-2">{validationError}</p>
              )}

              <div className="mt-4">
                <TextAreas
                  id="reportDetails"
                  ariaLabel="Additional report details"
                  placeholder="Provide more information about your report..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  error={validationError}
                />
              </div>
            </div>
          )}
        </PrimaryModal>
      )}
      {status === "closed" && (
        <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-t-xl flex items-center">
          <Lock size={14} className="text-gray-500 dark:text-gray-400 mr-2" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            This thread has been closed
          </span>
        </div>
      )}

      <div className="p-5">
        {/* Author info and actions row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-medium">
              {author?.name?.charAt(0)}
            </div>
            <div className="ml-3">
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                {author?.name}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {timeAgo(createdAt)}
              </p>
            </div>
          </div>

          {/* Dropdown menu */}
          <div className="relative">
            <button
              onClick={handleDropdownToggle}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <MoreVertical size={18} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 z-10 mt-1 w-48 rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="py-1">
                  {isAuthor ? (
                    <>
                      <button
                        onClick={handleDelete}
                        className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Trash size={16} className="mr-2" />
                        Delete Thread
                      </button>
                      <button
                        onClick={handleToggleStatus}
                        className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {status === "closed" ? (
                          <>
                            <Unlock size={16} className="mr-2 text-green-500" />
                            Activate Thread
                          </>
                        ) : (
                          <>
                            <Lock size={16} className="mr-2" />
                            Close Thread
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleReport}
                      className="flex items-center w-full px-4 py-2 text-sm text-left text-yellow-600 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Flag size={16} className="mr-2" />
                      Report
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Thread content */}
        <Link to={`/thread/${_id}`} className="block">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 hover:text-primary dark:hover:text-primary-light transition-colors">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
            {truncatedContent}
          </p>

          {/* Tags */}
          {tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Thread metrics */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <Eye size={16} className="mr-1" />
                <span className="text-xs">{views}</span>
              </div>
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <MessageSquare size={16} className="mr-1" />
                <span className="text-xs">{comments?.length}</span>
              </div>
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <ArrowUp size={16} className="mr-1" />
                <span className="text-xs">{likes?.length}</span>
              </div>
            </div>

            {/* Status indicator for active threads */}
            {status !== "closed" && (
              <span className="text-xs py-1 px-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full">
                Active
              </span>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ThreadCard;
