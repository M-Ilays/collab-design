import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";
import DetailedThreadCard from "../components/Forum/Thread/DetailedThreadCard";
import CommentList from "../components/Forum/Thread/CommentList";
import CommentForm from "../components/Forum/Thread/CommentForm";
import DashboardHeader from "../../src/components/Dashboard/DashboardHeader";
import ShowError from "../overlays/ShowError";

const ThreadDetails = () => {
  const { threadId } = useParams();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [commentReplies, setCommentReplies] = useState({});
  const [error, setError] = useState({ show: false, message: "" });

  const closeError = () => {
    setError({ show: false, message: "" });
  };
  // Fetch thread details
  useEffect(() => {
    api
      .get(`/api/forum/${threadId}`)
      .then((res) => {
        setThread(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching thread details:", err);
        setLoading(false);
      });
  }, [threadId]);

  // Helper to refresh thread data from backend
  const refreshThread = async () => {
    try {
      const res = await api.get(`/api/forum/${threadId}`);
      setThread(res.data);
    } catch (err) {
      console.error("Error refreshing thread:", err);
    }
  };

  // Handle new comment submission
  const handleCommentSubmit = async (commentContent) => {
    if (!user) {
      setError({
        show: true,
        message: "You must be logged in to comment.",
      });
      return;
    }
    try {
      const res = await api.post(
        `/api/forum/${threadId}/comment`,
        { content: commentContent },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      // Update thread with new comment
      setThread((prevThread) => ({
        ...prevThread,
        comments: [...prevThread.comments, res.data],
      }));
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  // Handle reply submission (support reply to comment and reply to reply)
  const handleReplySubmit = async (replyContent, commentId, replyId = null) => {
    if (!user) {
      setError({
        show: true,
        message: "You must be logged in to comment.",
      });
      return;
    }
    try {
      let res;
      if (replyId) {
        // Reply to a reply (nested)
        res = await api.post(
          `/api/forum/${threadId}/comment/${commentId}/reply/${replyId}/reply`,
          { content: replyContent },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      } else {
        // Reply to a comment
        res = await api.post(
          `/api/forum/${threadId}/comment/${commentId}/reply`,
          { content: replyContent },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      }
      // Optimistically update UI
      setThread((prevThread) => {
        const newReply = res.data.reply;
        return {
          ...prevThread,
          comments: prevThread.comments.map((comment) => {
            if (comment._id === commentId) {
              if (replyId) {
                // Add nested reply to the correct reply
                const addNestedReply = (replies) =>
                  replies.map((reply) => {
                    if (reply._id === replyId) {
                      return {
                        ...reply,
                        replies: [...(reply.replies || []), newReply],
                      };
                    } else if (reply.replies && reply.replies.length > 0) {
                      return {
                        ...reply,
                        replies: addNestedReply(reply.replies),
                      };
                    }
                    return reply;
                  });
                return {
                  ...comment,
                  replies: addNestedReply(comment.replies),
                };
              } else {
                // Add reply to comment
                return { ...comment, replies: [...comment.replies, newReply] };
              }
            }
            return comment;
          }),
        };
      });
      // Refresh in background (not blocking UI)
      refreshThread();
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  // Handle upvote submission
  const handleUpvote = async () => {
    if (!user) {
      setError({ show: true, message: "You must be logged in to upvote." });
      return;
    }
    try {
      const res = await api.post(
        `/api/forum/${threadId}/upvote`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      if (res.status === 200) {
        setThread((prev) => ({ ...prev, likes: res.data.thread.likes }));
      }
    } catch (error) {
      console.error("Error upvoting thread:", error);
    }
  };

  // Like/dislike comment or reply
  const handleLikeComment = async (commentId, isReply = false, replyId = null) => {
    if (!user) {
      setError({
        show: true,
        message: "You must be logged in to like comments.",
      });
      return;
    }
    try {
      let res;
      if (isReply && replyId) {
        res = await api.post(
          `/api/forum/${threadId}/comment/${commentId}/reply/${replyId}/like`,
          {},
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      } else {
        res = await api.post(
          `/api/forum/${threadId}/comment/${commentId}/like`,
          {},
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      }
      // Optimistically update UI
      setThread((prevThread) => {
        const updateLikes = (replies) =>
          replies.map((reply) => {
            if (isReply && reply._id === replyId) {
              return {
                ...reply,
                likes: res.data.likes,
                dislikes: res.data.dislikes,
              };
            } else if (reply.replies && reply.replies.length > 0) {
              return {
                ...reply,
                replies: updateLikes(reply.replies),
              };
            }
            return reply;
          });
        return {
          ...prevThread,
          comments: prevThread.comments.map((comment) => {
            if (comment._id === commentId) {
              if (isReply && replyId) {
                return {
                  ...comment,
                  replies: updateLikes(comment.replies),
                };
              } else {
                return {
                  ...comment,
                  likes: res.data.likes,
                  dislikes: res.data.dislikes,
                };
              }
            }
            return comment;
          }),
        };
      });
      // Refresh in background
      refreshThread();
    } catch (error) {
      console.error("Error liking comment/reply:", error);
      setError({
        show: true,
        message: error.response?.data?.message || "Failed to like the comment/reply.",
      });
    }
  };

  const handleDislikeComment = async (commentId, isReply = false, replyId = null) => {
    if (!user) {
      setError({
        show: true,
        message: "You must be logged in to dislike comments.",
      });
      return;
    }
    try {
      let res;
      if (isReply && replyId) {
        res = await api.post(
          `/api/forum/${threadId}/comment/${commentId}/reply/${replyId}/dislike`,
          {},
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      } else {
        res = await api.post(
          `/api/forum/${threadId}/comment/${commentId}/dislike`,
          {},
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      }
      // Optimistically update UI
      setThread((prevThread) => {
        const updateDislikes = (replies) =>
          replies.map((reply) => {
            if (isReply && reply._id === replyId) {
              return {
                ...reply,
                likes: res.data.likes,
                dislikes: res.data.dislikes,
              };
            } else if (reply.replies && reply.replies.length > 0) {
              return {
                ...reply,
                replies: updateDislikes(reply.replies),
              };
            }
            return reply;
          });
        return {
          ...prevThread,
          comments: prevThread.comments.map((comment) => {
            if (comment._id === commentId) {
              if (isReply && replyId) {
                return {
                  ...comment,
                  replies: updateDislikes(comment.replies),
                };
              } else {
                return {
                  ...comment,
                  likes: res.data.likes,
                  dislikes: res.data.dislikes,
                };
              }
            }
            return comment;
          }),
        };
      });
      // Refresh in background
      refreshThread();
    } catch (error) {
      console.error("Error disliking comment/reply:", error);
      setError({
        show: true,
        message: error.response?.data?.message || "Failed to dislike the comment/reply.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      {error.show && <ShowError text={error.message} onClose={closeError} />}

      <DashboardHeader showSearch={1} showBack={1} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="space-y-6">
          {/* Thread Details Card */}
          <DetailedThreadCard
            thread={thread}
            handleUpvote={handleUpvote}
            upvoteOption={user ? true : false}
            upvoted={user && thread.likes && thread.likes.includes(user.id)}
          />

          {/* Comment Form */}
          {user && <CommentForm handleCommentSubmit={handleCommentSubmit} />}

          {/* Comments List */}
          <CommentList
            handleLikeComment={handleLikeComment}
            handleDislikeComment={handleDislikeComment}
            comments={thread.comments}
            user={user}
            handleReplySubmit={handleReplySubmit}
            commentReplies={commentReplies}
            setCommentReplies={setCommentReplies}
          />
        </div>
      </div>
    </div>
  );
};

export default ThreadDetails;
