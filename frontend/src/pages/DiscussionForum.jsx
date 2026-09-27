import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext"; // Import the theme context
import api from "../api";
import ThreadCard from "../components/Forum/ThreadCard";
import CreateThreadCard from "../components/Forum/CreateThreadCard";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import { ChevronDown, ArrowRight, ArrowUp, MessageSquare } from "lucide-react";
import ShowError from "../overlays/ShowError";

const Forum = () => {
  const [threads, setThreads] = useState([]);
  const [filteredThreads, setFilteredThreads] = useState([]);
  const [activeTab, setActiveTab] = useState("Recents");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const { isDarkMode } = useTheme(); // Use the theme context
  const { user } = useAuth();
  const [error, setError] = useState({ show: false, message: "" });

  const closeError = () => {
    setError({ show: false, message: "" });
  };

  useEffect(() => {
    api
      .get("/api/forum")
      .then((res) => {
        setThreads(res.data);
        filterThreads(res.data, "Recents");
      })
      .catch((err) => console.error(err));
  }, []);

  const handlePostSubmit = async (post) => {
    if (!user) {
      setError({
        show: true,
        message: "You must be logged in to create a thread",
      });
      return;
    }
    try {
      const formData = new FormData();
      formData.append("title", post.title);
      formData.append("content", post.content);
      post.tags.forEach((tag) => formData.append("tags", tag));
      post.files.forEach((file) => formData.append("files", file));

      const res = await api.post("/api/forum", formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedThreads = [res.data, ...threads];
      setThreads(updatedThreads);
      filterThreads(updatedThreads, activeTab);
    } catch (error) {
      console.error("Error creating thread:", error);
    }
  };

  const filterThreads = (allThreads, tab) => {
    let filtered = allThreads;
    switch (tab) {
      case "Recents":
        filtered = allThreads
          .filter((thread) => thread.status !== "closed")
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "Most Upvoted":
        filtered = allThreads
          .filter((thread) => thread.status !== "closed")
          .sort((a, b) => b.likes.length - a.likes.length);
        break;
      case "Most Commented":
        filtered = allThreads
          .filter((thread) => thread.status !== "closed")
          .sort((a, b) => b.comments.length - a.comments.length);
        break;
      case "My Threads":
        if (user) {
          filtered = allThreads.filter(
            (thread) => thread?.author?._id === user.id
          );
        } else {
          filtered = [];
        }
        break;
      case "Closed":
        filtered = allThreads.filter((thread) => thread.status === "closed");
        break;
      default:
        filtered = allThreads;
    }
    setFilteredThreads(filtered);
  };

  useEffect(() => {
    filterThreads(threads, activeTab);
  }, [activeTab, threads]);

  const handleDeleteThread = async (threadId) => {
    if (!user) {
      setError({
        show: true,
        message: "You must be logged in to delete a thread",
      });
      return;
    }
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this thread?"
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/api/forum/${threadId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const updatedThreads = threads.filter(
        (thread) => thread._id !== threadId
      );
      setThreads(updatedThreads);
      filterThreads(updatedThreads, activeTab);
    } catch (error) {
      console.error("Error deleting thread:", error);
    }
  };

  const handleToggleThreadStatus = async (threadId) => {
    if (!user) {
      setError({
        show: true,
        message: "You must be logged in to modify a thread",
      });
      return;
    }

    try {
      const res = await api.put(
        `/api/forum/${threadId}/close`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      const updatedThreads = threads.map((thread) =>
        thread._id === threadId
          ? { ...thread, status: res.data.thread.status }
          : thread
      );

      setThreads(updatedThreads);
      filterThreads(updatedThreads, activeTab);
    } catch (error) {
      console.error("Error toggling thread status:", error);
    }
  };

  const tabOptions = [
    "Recents",
    "Most Upvoted",
    "Most Commented",
    "Closed",
    ...(user ? ["My Threads"] : []),
  ];

  const getSortIcon = () => {
    switch (activeTab) {
      case "Recents":
        return <ArrowRight size={16} />;
      case "Most Upvoted":
        return <ArrowUp size={16} />;
      case "Most Commented":
        return <MessageSquare size={16} />;
      default:
        return <ArrowRight size={16} />;
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-200 bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
      {error.show && <ShowError text={error.message} onClose={closeError} />}
      <DashboardHeader showBack={1} showSearch={1} />

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Forum Discussions
          </h1>
        </div>

        {user && (
          <div className="mb-6">
            <CreateThreadCard onSubmit={handlePostSubmit} />
          </div>
        )}

        <div className="flex justify-between items-center mb-6 p-4 rounded-lg bg-white dark:bg-gray-800 shadow">
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center space-x-2 px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center">
                {getSortIcon()}
                <span className="ml-2">{activeTab}</span>
              </div>
              <ChevronDown size={16} />
            </button>

            {showFilterMenu && (
              <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg z-10 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  {tabOptions.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setShowFilterMenu(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        activeTab === tab
                          ? "bg-blue-50 text-blue-700 dark:bg-gray-600 dark:text-white"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredThreads.length} thread
            {filteredThreads.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="space-y-4">
          {filteredThreads.length > 0 ? (
            filteredThreads.map((thread, index) => (
              <div
                key={index}
                className="rounded-lg shadow bg-white dark:bg-gray-800"
              >
                <ThreadCard
                  {...thread}
                  activeTab={activeTab}
                  onDelete={handleDeleteThread}
                  onToggleStatus={handleToggleThreadStatus}
                />
              </div>
            ))
          ) : (
            <div className="p-8 text-center rounded-lg bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              No threads found. {!user && "Sign in to create a new thread."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Forum;
