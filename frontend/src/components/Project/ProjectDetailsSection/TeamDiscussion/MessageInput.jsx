import { useState } from "react";
import { FaRegSmile, FaPaperclip } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";

const MessageInput = ({ socket, projectId, user, setMessages }) => {
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const sendMessage = () => {
    if (!user || !newMessage.trim()) return;

    const messageData = { sender: user.id, text: newMessage, projectId };

    setMessages((prevMessages) => [
      ...prevMessages,
      { ...messageData, _id: Date.now(), seenBy: [] },
    ]);
    socket.emit("sendMessage", messageData);
    setNewMessage("");
  };

  return (
    <div className="border-t pt-3 flex items-center relative">
      {showEmojiPicker && (
        <EmojiPicker
          onEmojiClick={(emoji) => setNewMessage((prev) => prev + emoji.emoji)}
          className="absolute top-10 left-0"
        />
      )}
      <FaRegSmile
        className="text-gray-500 text-lg cursor-pointer mr-3"
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
      />
      <FaPaperclip className="text-gray-500 text-lg cursor-pointer mr-3" />
      <input
        type="text"
        placeholder="Type your message here..."
        className="flex-1 p-2 border rounded-md bg-transparent"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
      <button
        onClick={sendMessage}
        className="ml-2 bg-green-500 text-white px-4 py-2 rounded-md"
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;
