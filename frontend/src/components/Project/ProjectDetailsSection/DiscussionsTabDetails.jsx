import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { useAuth } from "../../../contexts/AuthContext";
import { BACKEND_URL } from "../../../constants/BACKEND";
import { FaRegSmile, FaPaperclip, FaFileAlt, FaDownload } from "react-icons/fa";
import OverLappingCircles from "../../../utils/Shapes/OverLappingCircles";
import Circle from "../../../utils/Shapes/Circle";
import EmojiPicker from "emoji-picker-react";
import { AiOutlineDownload } from "react-icons/ai";
import MediaViewer from "../../../utils/Attachments/MediaViewer";
import { FiSend } from "react-icons/fi";

const socket = io(BACKEND_URL);

const DiscussionsTabDetail = ({ projectId, projectName, members, owner }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState([]);
  // Media Viewer state
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [mediaFiles, setMediaFiles] = useState([]);

  useEffect(() => {
    const allMedia = [];
    messages.forEach((msg) => {
      if (msg.attachments && msg.attachments.length > 0) {
        msg.attachments.forEach((attachment) => {
          if (isMediaFile(attachment)) {
            allMedia.push(attachment);
          }
        });
      }
    });
    setMediaFiles(allMedia);
  }, [messages]);

  // Helper function to check if a file is media (image or video)
  const isMediaFile = (url) => {
    return /\.(jpg|jpeg|png|gif|mp4|webm|ogg)$/i.test(url);
  };

  // Open media viewer with the clicked media
  const openMediaViewer = (url) => {
    const index = mediaFiles.findIndex((file) => file === url);
    if (index !== -1) {
      setCurrentMediaIndex(index);
      setIsViewerOpen(true);
    }
  };

  const handleFileChange = (e) => {
    setAttachments([...e.target.files]);
  };

  const updatedMembers = [...members, owner];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (projectId) {
      socket.emit("joinProject", projectId);
    }

    fetchMessages();

    socket.on("newMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on("messageSeen", ({ messageId, seenBy, totalMembers }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, seenBy, totalMembers } : msg
        )
      );
    });

    return () => {
      socket.off("newMessage");
      socket.off("messageSeen");
    };
  }, [projectId]);

  // Emit `seenMessage` when messages are in view
  useEffect(() => {
    messages.forEach((msg) => {
      if (!msg.seenBy.includes(user.id)) {
        socket.emit("seenMessage", {
          messageId: msg._id,
          userId: user.id,
          projectId,
        });
      }
    });
  }, [messages, user.id, projectId]);

  // Fetch existing messages
  const fetchMessages = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/discussions/${projectId}`);
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Handle sending messages
  const sendMessage = async () => {
    if (!user || (!newMessage.trim() && attachments.length === 0)) return;

    try {
      let fileUrls = [];
      if (attachments.length > 0) {
        // Upload files first
        const formData = new FormData();
        attachments.forEach((file) => {
          formData.append("attachments", file);
        });

        const uploadResponse = await fetch(
          `${BACKEND_URL}/api/discussions/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await uploadResponse.json();
        fileUrls = data.fileUrls;
      }

      // Send message with file URLs
      const messageData = {
        sender: user.id,
        text: newMessage,
        projectId,
        attachments: fileUrls, // Include file URLs
      };
      socket.emit("sendMessage", messageData);

      setNewMessage("");
      setAttachments([]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle selecting an emoji
  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  return (
    <div className="bg-white dark:bg-dark mb-10  p-4 rounded-lg relative shadow-lg w-full h-[80vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center border-b pb-3">
        {/* Overlapping circles for members including owner */}
        <div className="relative flex bottom-5">
          {updatedMembers.slice(0, 5).map((member, index) => (
            <OverLappingCircles
              key={member?.id}
              text={member?.name[0].toUpperCase()}
              index={index}
              ImageUrl={member?.profilePicture ? member?.profilePicture : null}
            />
          ))}
        </div>
        <div className="flex w-full justify-center">
          <h2 className="text-lg font-semibold ml-4">
            {"Team " + projectName}
          </h2>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto scrollbar-hidden p-2 space-y-4">
        {messages.map((msg) => {
          const isCurrentUser = msg.sender._id === user.id;
          const seenByAll = msg.seenBy.length === updatedMembers.length;

          return (
            <div
              key={msg._id}
              className={`flex items-center ${
                isCurrentUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isCurrentUser && (
                <Circle
                  text={msg.sender.name[0].toUpperCase()}
                  colour="bg-blue-500"
                  className="mr-2 "
                />
              )}
              <div
                className={`flex flex-col max-w-xs sm:max-w-md ${
                  isCurrentUser ? "items-end" : "items-start"
                }`}
              >
                <p className="text-xs text-gray-500 dark:text-gray-300">
                  {msg.sender.name}
                </p>
                <div
                  className={`p-3 rounded-lg max-w-[95%] break-words ${
                    isCurrentUser
                      ? "bg-primary text-white"
                      : "bg-[#F2F2F7] dark:bg-dark-900 dark:text-white text-[#2C2C2E]"
                  }`}
                >
                  {/* Display attachments */}
                  {msg.attachments &&
                    msg.attachments.map((attachment, index) => {
                      const fileNameWithTimestamp = attachment.split("/").pop(); // Get filename from path
                      const fileParts = fileNameWithTimestamp.split("-"); // Split at '-'
                      const fileName = fileParts.slice(1).join("-"); // Remove timestamp prefix
                      const fileExtension = fileName
                        .split(".")
                        .pop()
                        .toUpperCase(); // Get extension

                      const isImage = /\.(jpg|jpeg|png|gif)$/i.test(attachment);
                      const isVideo = /\.(mp4|webm|ogg)$/i.test(attachment);

                      return isImage ? (
                        <img
                          key={index}
                          src={attachment}
                          alt="attachment"
                          className="max-w-full h-auto rounded-lg mt-2"
                          onClick={() => openMediaViewer(attachment)}
                        />
                      ) : isVideo ? (
                        <div className="relative">
                          <video
                            key={index}
                            controls
                            className="max-w-full h-auto rounded-lg mt-2"
                          >
                            <source
                              src={attachment}
                              type={`video/${fileExtension.toLowerCase()}`}
                            />
                          </video>
                          <button
                            onClick={() => openMediaViewer(attachment)}
                            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded"
                          >
                            Fullscreen
                          </button>
                        </div>
                      ) : (
                        <div
                          key={index}
                          className={`flex items-center bg-transparent border ${
                            isCurrentUser
                              ? "border-purple-300  "
                              : "border-gray-400 dark:border-purple-400"
                          }  p-2 rounded-lg mt-2 w-full max-w-xs`}
                        >
                          <FaFileAlt className="text-gray-400 text-2xl mr-3" />{" "}
                          {/* File Icon */}
                          <div className="flex flex-col truncate w-full">
                            <span className="font-semibold text-sm truncate">
                              {fileName}
                            </span>
                            <span
                              className={`text-xs ${
                                isCurrentUser
                                  ? "text-gray-200 dark:text-gray-300"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {fileExtension} File
                            </span>
                          </div>
                          <a
                            href={attachment}
                            download={fileName}
                            target="_blank"
                            className="ml-3"
                          >
                            <AiOutlineDownload
                              size={24}
                              className={`${
                                isCurrentUser
                                  ? "text-gray-200 dark:text-gray-300 dark:hover:text-white hover:text-white transition-colors"
                                  : "text-gray-500 dark:text-gray-300 dark:hover:text-white hover:text-black transition-colors"
                              }`}
                            />
                          </a>
                        </div>
                      );
                    })}

                  <p className="text-sm mt-2 ">{msg.text}</p>
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
        })}
        <div ref={messagesEndRef}></div>
      </div>

      {isViewerOpen && (
        <MediaViewer
          files={mediaFiles}
          currentIndex={currentMediaIndex}
          setCurrentIndex={setCurrentMediaIndex}
          onClose={() => setIsViewerOpen(false)}
        />
      )}

      {/* Input Field with Icons */}
      <div className="border-t pt-3 relative">
        {/* Attached Files Preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 px-2">
            {Array.from(attachments).map((file, index) => (
              <div
                key={index}
                className="
            flex items-center 
            bg-gray-100 hover:bg-gray-200 
            dark:bg-gray-800 dark:hover:bg-gray-700 
            rounded-full px-3 py-1 text-sm 
            transition-colors cursor-pointer
          "
              >
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button
                  onClick={() => {
                    const newAttachments = Array.from(attachments);
                    newAttachments.splice(index, 1);
                    setAttachments(newAttachments);
                  }}
                  className="ml-2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Container */}
        <div
          className="
      flex items-center 
      bg-gray-50 dark:bg-gray-900 
      rounded-2xl px-4 py-2 
      focus-within:ring-2 focus-within:ring-primary/50 dark:focus-within:ring-primary/70 
      transition-all
    "
        >
          {/* Emoji Button */}
          <button
            className="text-gray-500 hover:text-primary dark:hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <FaRegSmile className="text-lg" />
          </button>

          {/* Message Input */}
          <input
            type="text"
            placeholder="Type your message here..."
            className="flex-1 px-4 py-2 bg-transparent outline-none text-gray-800 dark:text-gray-200"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />

          {/* Attachment Button */}
          <label
            htmlFor="file-upload"
            className="text-gray-500 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <FaPaperclip className="text-lg" />
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Send Button */}
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() && attachments.length === 0}
            className="
    bg-primary hover:bg-primary-dark 
    disabled:bg-gray-300 dark:disabled:bg-gray-700 
    text-white p-2 rounded-full 
    transition-all transform hover:scale-105 active:scale-95 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark
  "
          >
            <FiSend className="h-5 w-5" />
          </button>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-full mb-2 left-0">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussionsTabDetail;
