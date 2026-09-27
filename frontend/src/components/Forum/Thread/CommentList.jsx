import React from "react";
import CommentItem from "./CommentItem";
import { MessageSquare } from "lucide-react";

const CommentList = ({
  handleDislikeComment,
  handleLikeComment,
  comments,
  user,
  handleReplySubmit,
  commentReplies,
  setCommentReplies,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-200">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare size={20} className="text-purple-500" />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Comments ({comments.length})
        </h2>
      </div>

      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              handleLikeComment={handleLikeComment}
              handleDislikeComment={handleDislikeComment}
              key={comment._id}
              comment={comment}
              user={user}
              handleReplySubmit={handleReplySubmit}
              commentReplies={commentReplies}
              setCommentReplies={setCommentReplies}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <MessageSquare
              size={40}
              className="text-gray-300 dark:text-gray-600 mb-3"
            />
            <p className="text-gray-500 dark:text-gray-400">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentList;
