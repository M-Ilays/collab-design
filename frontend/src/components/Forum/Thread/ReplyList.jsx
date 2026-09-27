import React from "react";
import Circle from "../../../utils/Shapes/Circle";

const ReplyList = ({ replies }) => {
  return (
    replies.length > 0 && (
      <div className="ml-10 mt-2 border-l border-gray-300 pl-4">
        {replies.map((reply) => (
          <div key={reply._id} className="mb-2">
            <div className="flex items-center">
              <Circle text={reply.author.name.charAt(0)} colour="bg-gray-500" />
              <div className="ml-3">
                <p className="font-semibold text-primary-heading dark:text-white">
                  @{reply.author.name}
                </p>
                <p className="text-sm text-primary-subtitle dark:text-gray-400">
                  {new Date(reply.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 py-2 px-10 dark:text-gray-200">
              {reply.content}
            </p>
          </div>
        ))}
      </div>
    )
  );
};

export default ReplyList;
