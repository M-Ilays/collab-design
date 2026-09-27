import React, { useState } from "react";
import { CornerDownRight, ThumbsUp, Reply, ThumbsDown } from "lucide-react";

const CommentItem = ({
  handleDislikeComment,
  handleLikeComment,
  comment,
  user,
  handleReplySubmit,
  commentReplies,
  setCommentReplies,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null); // For reply-to-reply input

  const handleReplySubmission = (e, replyId = null) => {
    e.preventDefault();
    if (replyContent.trim() === "") return;

    if (replyId) {
      handleReplySubmit(replyContent, comment._id, replyId);
      setActiveReplyId(null);
    } else {
    handleReplySubmit(replyContent, comment._id);
      setShowReplyForm(false);
    }
    setReplyContent("");
  };

  // Format the date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  // Check if current user has liked/disliked the comment
  const hasLiked = user && comment?.likes?.includes(user.id);
  const hasDisliked = user && comment?.dislikes?.includes(user.id);

  // Helper to render nested replies inline (not using CommentItem)
  const renderReplies = (replies, parentCommentId) => {
    if (!replies || replies.length === 0) return null;
    return (
      <div className="mt-2 ml-4 border-l-2 border-primary/10 dark:border-primary/30">
        {replies.map((reply, idx) => (
          <div
            key={reply._id || idx}
            className="flex items-start gap-2 pl-4 border-l-2 border-primary/20 dark:border-primary/40"
          >
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 dark:bg-primary/30 text-primary dark:text-primary flex items-center justify-center text-xs font-medium">
              {reply.author?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  @{reply.author?.name || "Unknown"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(reply.createdAt)}
                </span>
              </div>
              <div className="text-gray-700 dark:text-gray-300 text-sm">
                {reply.content}
              </div>
              {/* Reply actions for reply (smaller, lighter) */}
              <div className="flex items-center gap-2 mt-1 ml-1">
                <button
                  onClick={() => handleLikeComment(parentCommentId, true, reply._id)}
                  className={`flex items-center gap-1 text-xs transition-colors duration-200 ${
                    user && reply.likes?.includes(user.id)
                      ? "text-primary dark:text-primary font-semibold"
                      : "text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary"
                  }`}
                  aria-label="Like reply"
                >
                  <ThumbsUp size={12} />
                  <span>{reply.likes?.length || 0}</span>
                </button>
                <button
                  onClick={() => handleDislikeComment(parentCommentId, true, reply._id)}
                  className={`flex items-center gap-1 text-xs transition-colors duration-200 ${
                    user && reply.dislikes?.includes(user.id)
                      ? "text-primary dark:text-primary font-semibold"
                      : "text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary"
                  }`}
                  aria-label="Dislike reply"
                >
                  <ThumbsDown size={12} />
                  <span>{reply.dislikes?.length || 0}</span>
                </button>
                {user && (
                  <button
                    onClick={() => setActiveReplyId(reply._id)}
                    className="flex items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary text-xs transition-colors duration-200"
                    aria-label="Reply to reply"
                  >
                    <Reply size={12} />
                    <span>Reply</span>
                  </button>
                )}
              </div>
              {/* Reply-to-reply input */}
              {activeReplyId === reply._id && (
                <form onSubmit={(e) => handleReplySubmission(e, reply._id)} className="mb-3 mt-2">
                  <div className="flex items-start gap-2 mb-2">
                    <CornerDownRight size={14} className="mt-2 text-gray-400" />
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:text-white text-xs transition-colors duration-200"
                      placeholder={`Reply to @${reply.author?.name || "Unknown"}...`}
                      rows="2"
                    ></textarea>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveReplyId(null)}
                      className="px-2 py-1 mr-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-2 py-1 bg-primary hover:bg-primary-hover text-white rounded-md text-xs transition-colors duration-200"
                      disabled={!replyContent.trim()}
                    >
                      Reply
                    </button>
                  </div>
                </form>
              )}
              {/* Render nested replies inline */}
              {reply.replies && reply.replies.length > 0 && renderReplies(reply.replies, parentCommentId)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-4 mb-4 last:pb-0 last:mb-0">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/30 text-primary dark:text-primary flex items-center justify-center font-medium">
          {comment.author?.name?.charAt(0).toUpperCase() || "U"}
        </div>

        <div className="flex-1">
          {/* Comment header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                @{comment.author?.name || "Unknown"}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleLikeComment(comment._id)}
                className={`flex items-center gap-1 text-sm transition-colors duration-200 ${
                  hasLiked
                    ? "text-primary dark:text-primary font-semibold"
                    : "text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                }`}
              >
                <ThumbsUp size={14} />
                <span>{comment.likes?.length || 0}</span>
              </button>
              <button
                onClick={() => handleDislikeComment(comment._id)}
                className={`flex items-center gap-1 text-sm transition-colors duration-200 ${
                  hasDisliked
                    ? "text-primary dark:text-primary font-semibold"
                    : "text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                }`}
                aria-label="Dislike"
              >
                <ThumbsDown size={14} />
                <span>{comment.dislikes?.length || 0}</span>
              </button>
              {user && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm transition-colors duration-200"
                  aria-label="Reply"
                >
                  <Reply size={14} />
                  <span>Reply</span>
                </button>
              )}
            </div>
          </div>

          {/* Comment content */}
          <div className="text-gray-700 dark:text-gray-300 mb-2">
            {comment.content}
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <form onSubmit={(e) => handleReplySubmission(e)} className="mb-3">
              <div className="flex items-start gap-2 mb-2">
                <CornerDownRight size={16} className="mt-2 text-gray-400" />
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:text-white text-sm transition-colors duration-200"
                  placeholder="Write your reply..."
                  rows="2"
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowReplyForm(false)}
                  className="px-3 py-1 mr-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-primary hover:bg-primary-hover text-white rounded-md text-sm transition-colors duration-200"
                  disabled={!replyContent.trim()}
                >
                  Reply
                </button>
              </div>
            </form>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            renderReplies(comment.replies, comment._id)
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
