import React, { useState } from "react";
import { Send } from "lucide-react";

const CommentForm = ({ handleCommentSubmit }) => {
  const [comment, setComment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.trim() === "") return;
    await handleCommentSubmit(comment);
    setComment(""); // Clear input field immediately after submission
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors duration-200">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Add a Comment
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <textarea
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:text-white transition-colors duration-200"
            placeholder="Share your thoughts on this thread..."
            rows="3"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors duration-200"
            disabled={!comment.trim()}
          >
            <Send size={18} />
            <span>Comment</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;