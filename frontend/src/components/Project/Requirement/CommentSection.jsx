import { CiCircleCheck } from "react-icons/ci";
import PropTypes from "prop-types";

const CommentSection = ({ comments, handleResolve }) => {
  return (
    <>
      {comments.map((comment, index) => {
        // Skip rendering if comment is invalid
        if (!comment?._id || !comment?.author) {
          return null;
        }

        return (
          <div
            key={comment._id || index} // Use _id if available, fallback to index
            className={`flex flex-col self-stretch px-4 py-5 w-full rounded-lg my-2 ${
              comment.type === "highlight"
                ? "bg-emerald-50 dark:bg-dark-50"
                : "bg-stone-50 dark:bg-dark-900 dark:border dark:border-gray-100"
            } max-md:max-w-full`}
          >
            <div className="flex flex-wrap gap-5 justify-between w-full max-md:max-w-full">
              <div className="flex gap-3.5 self-start">
                <div className="grow text-base text-black dark:text-gray-100">
                  {comment.author?.name || "Unknown User"}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300">
                  {comment.time}
                </div>
              </div>
              {comment.type === "normal" && handleResolve && (
                <button
                  onClick={() => handleResolve(comment._id)} // Use handleResolve from parent
                  className="flex gap-1 items-center px-4 py-2 text-sm text-center text-gray-800 whitespace-nowrap rounded-md border border-solid border-slate-200 hover:border-gray-400 dark:text-gray-400 dark:hover:text-gray-100 dark:border-gray-100 dark:hover:border-gray-50"
                >
                  <CiCircleCheck className="hover:text-primary-heading dark:hover:text-gray-100" />
                  <span className="self-stretch my-auto hover:text-primary-heading dark:hover:text-gray-100">
                    Resolve
                  </span>
                </button>
              )}
            </div>
            <div className="self-start mt-3.5 text-base text-gray-700 dark:text-gray-100">
              {comment.content}
            </div>
          </div>
        );
      })}
    </>
  );
};

CommentSection.propTypes = {
  requirementId: PropTypes.string.isRequired,
  comments: PropTypes.array.isRequired,
  handleResolve: PropTypes.func,
};

export default CommentSection;
