import React, { useState, useRef, useEffect } from "react";
import Circle from "../utils/Shapes/Circle.jsx";
import { FaAngleDown } from "react-icons/fa";
import { PiMoonFill, PiMoonThin } from "react-icons/pi";
import { IoMdNotificationsOutline } from "react-icons/io";
import Community from "../assets/icons/community.svg";
import CommunityDarkMode from "../assets/icons/communityWhite.svg";
import { useTheme } from "../contexts/ThemeContext.jsx";
import PrimaryDropDown from "../utils/Menus/PrimaryDropDown.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { IoSettingsOutline } from "react-icons/io5";
import { BiLogOut } from "react-icons/bi";
import PrimaryButton from "../utils/Buttons/PrimaryButton.jsx";
import { BACKEND_URL } from "../constants/BACKEND.js";
import io from "socket.io-client";

const socket = io(BACKEND_URL);

const HeaderIcons = () => {
  const { isDarkMode, toggleTheme, setLightTheme } = useTheme();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const userInitial = user?.name?.charAt(0).toUpperCase() || "";
  const [userName, setUserName] = useState(user?.name);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);
  const [hasUnseen, setHasUnseen] = useState(false);

  const [version, setVersion] = useState(0);
  useEffect(() => {
    setVersion((v) => v + 1);
  }, [user]);

  useEffect(() => {
    setUserName(user?.name);
  }, [user?.name]);

  // Mark notifications as seen API call
  const markNotificationsAsSeen = async () => {
    setHasUnseen(false);

    try {
      await fetch(`${BACKEND_URL}/api/notifications/markAllAsSeen`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("collabToken")}`,
        },
      });

      // Update local state to mark all as seen
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, seen: true }))
      );
    } catch (error) {
      console.error("Error marking notifications as seen:", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
        // Call the API to mark notifications as seen when clicking outside
        if (notifOpen) {
          markNotificationsAsSeen();
        }
      }
    }
    if (notifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notifOpen]);

  useEffect(() => {
    socket.emit("join", user?.id);
    console.log("Emitted join for user:", user?.id);
  }, [user]);

  useEffect(() => {
    const handleNewNotification = (data) => {
      console.log("Received newNotification via socket:", data);
      setHasUnseen(true);
      // Add the new notification to the existing list
      setNotifications((prev) => [data, ...prev]);
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetch(`${BACKEND_URL}/api/notifications`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("collabToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setHasUnseen((data.notifications || []).some((n) => !n.seen));
      });
  }, [user]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("collabToken");
      localStorage.setItem("collabDarkMode", false);
      setLightTheme();
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleNotifClick = async () => {
    setNotifOpen((prev) => !prev);
    if (!notifOpen) {
      // Fetch latest notifications when opening
      const res = await fetch(`${BACKEND_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("collabToken")}`,
        },
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
    }
  };

  const handleNotifClose = async () => {
    setNotifOpen(false);
    // Call the API to mark notifications as seen when cross is clicked
    await markNotificationsAsSeen();
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notifTime) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return "❤️";
      case "comment":
        return "💬";
      case "follow":
        return "👤";
      case "mention":
        return "📢";
      default:
        return "🔔";
    }
  };

  const dropdownMenuItems = [
    {
      label: "Settings",
      onClick: () => navigate("/settings"),
      icon: <IoSettingsOutline size={18} />,
    },
    {
      label: "Logout",
      onClick: handleLogout,
      icon: <BiLogOut size={18} />,
    },
  ];

  return (
    <div className="relative flex items-center justify-center gap-2">
      <img
        src={Community}
        onClick={() => navigate("/forum")}
        className="block cursor-pointer dark:hidden hover:scale-105 hover:opacity-80 transition duration-200"
        alt="community"
      />
      <img
        src={CommunityDarkMode}
        onClick={() => navigate("/forum")}
        className="hidden cursor-pointer dark:block hover:scale-105 hover:opacity-80 transition duration-200"
        alt="community"
      />

      {/* Theme Toggle */}
      <PiMoonThin
        size={24}
        className="cursor-pointer block text-black dark:hidden hover:text-gray-600 transition duration-200"
        onClick={toggleTheme}
      />
      <PiMoonFill
        size={24}
        className="cursor-pointer text-white hidden dark:block hover:text-gray-300 transition duration-200"
        onClick={toggleTheme}
      />

      {/* Notification Icon */}
      {user && (
        <div className="relative" ref={notifRef}>
          <IoMdNotificationsOutline
            size={24}
            className="cursor-pointer text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition duration-200"
            onClick={handleNotifClick}
          />
          {hasUnseen && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-3 h-3 bg-red-500 rounded-full">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 shadow-2xl rounded-xl z-50 border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="bg-primary to-purple-600 px-4 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-white text-lg">
                  Notifications
                </h3>
                <button
                  onClick={handleNotifClose}
                  className="text-white hover:text-gray-200 transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Notification List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <div className="text-gray-400 text-6xl mb-4">🔔</div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No notifications yet
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                      We'll notify you when something happens
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {notifications.map((notif, idx) => (
                      <div
                        key={notif._id || idx}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer relative ${
                          !notif.seen
                            ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                            : ""
                        }`}
                      >
                        {/* Unseen indicator */}
                        {!notif.seen && (
                          <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}

                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                              !notif.seen
                                ? "bg-blue-100 dark:bg-blue-900/40"
                                : "bg-gray-100 dark:bg-gray-600"
                            }`}
                          >
                            {getNotificationIcon(notif.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm ${
                                !notif.seen
                                  ? "text-gray-900 dark:text-white font-medium"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {notif.message}
                            </p>

                            {/* Timestamp */}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatTimeAgo(
                                notif.createdAt || notif.timestamp
                              )}
                            </p>

                            {/* Additional info if available */}
                            {notif.actionUrl && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 hover:underline">
                                View details →
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {/* {notifications.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 text-center">
            <button 
              onClick={() => {
                handleNotifClose();
                navigate('/notifications');
              }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200"
            >
              View all notifications
            </button>
          </div>
        )} */}
            </div>
          )}
        </div>
      )}

      {/* Avatar and Dropdown */}
      {user ? (
        <PrimaryDropDown
          trigger={
            <div className="flex gap-1 items-center">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  className="rounded-full w-7 h-7"
                />
              ) : (
                <Circle text={userInitial} color="#764BA2" />
              )}

              <span className="text-black hidden md:block dark:text-white text-sm font-medium truncate">
                {userName}
              </span>
              <FaAngleDown className="text-black dark:text-white" />
            </div>
          }
          menuItems={dropdownMenuItems}
          align="right"
        />
      ) : (
        <PrimaryButton
          text={"Sign in / Sign up"}
          action={() => {
            navigate("/");
          }}
        />
      )}
    </div>
  );
};

export default HeaderIcons;
