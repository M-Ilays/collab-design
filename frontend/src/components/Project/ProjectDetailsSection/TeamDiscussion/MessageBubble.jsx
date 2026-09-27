const MessageBubble = ({ msg, user, members }) => {
  const isCurrentUser = msg.sender._id === user.id;
  const seenByAll = msg.seenBy.length === members.length;

  return (
    <div
      className={`flex items-center ${
        isCurrentUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isCurrentUser && (
        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-2">
          {msg.sender.name[0].toUpperCase()}
        </div>
      )}
      <div
        className={`flex flex-col break-words ${
          isCurrentUser ? "items-end" : "items-start"
        }`}
      >
        <p className="text-xs text-gray-500 dark:text-gray-300">
          {msg.sender.name}
        </p>
        <div
          className={`p-3 rounded-lg ${
            isCurrentUser
              ? "bg-primary text-white"
              : "bg-[#F2F2F7] dark:bg-dark-900 dark:text-white text-[#2C2C2E]"
          }`}
        >
          <p className="text-sm">{msg.text}</p>
        </div>
        <p className="text-xs text-gray-400 mt-1 flex items-center">
          {new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {isCurrentUser && seenByAll && (
            <span className="ml-1 text-blue-600">✔✔</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
