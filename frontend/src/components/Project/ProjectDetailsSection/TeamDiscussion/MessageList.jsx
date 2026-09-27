import MessageBubble from "./MessageBubble";

const MessagesList = ({ messages, user, members }) => {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden p-2 space-y-4 ">
      {messages.map((msg) => (
        <MessageBubble key={msg._id} msg={msg} user={user} members={members} />
      ))}
    </div>
  );
};

export default MessagesList;
