import React, { useState, useRef, useEffect } from "react";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import SecondaryInput from "../utils/Inputs/SecondaryInput";
import { FaUser } from "react-icons/fa";
import { MdOutlineSecurity } from "react-icons/md";
import PrimaryButton from "../utils/Buttons/PrimaryButton";
import {
  IoIosNotifications,
  IoIosArrowDown,
  IoIosArrowUp,
} from "react-icons/io";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";
import Message from "../overlays/Message"; // <-- import your Message component

const AccordionSection = ({ title, icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="dark:bg-dark bg-[#FBFBFB] rounded-3xl p-6 md:p-8 text-base">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <h2 className="flex gap-2 items-center text-xl md:text-2xl font-semibold dark:text-primary">
          {icon} {title}
        </h2>
        <div className="bg-gray-200 dark:bg-dark-50 h-8 w-8 rounded-full flex items-center justify-center">
          {open ? <IoIosArrowUp size={22} /> : <IoIosArrowDown size={22} />}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="mt-4 flex flex-col gap-4"
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const Settings = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  console.log("user", user);

  // Avatar
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      // TODO: Upload to backend when API is ready
    }
  };

  // Password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Message modal
  const [messageText, setMessageText] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);

  // Add this inside the component
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("fullname", name);

      // If a new image was selected
      if (selectedImage && fileInputRef.current?.files[0]) {
        formData.append("profilePicture", fileInputRef.current.files[0]);
      }

      const res = await api.put("/api/user/update-user", formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.message == "User updated successfully") {
        showUserMessage(res.data?.message);
        setUser((prevUser) => ({
          ...prevUser,
          name: res.data.result.name,
          profilePicture: res.data.result.profilePicture,
        }));

        setIsSaving(false);

        // You might want to update the user context here
      } else {
        console.log("else API response:", res.data);
        showUserMessage(res.data?.message || "Profile update failed");
      }
    } catch (err) {
      console.log("catch API response:", res.data);
      showUserMessage("Something went wrong while updating profile.");
    } finally {
      console.log("finally API response:", res.data);
      setIsSaving(false);
    }
  };

  const showUserMessage = (text) => {
    setMessageText(text);
    setShowMessage(true);
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    navigate("/dashboard");
  };

  const handleChangePassword = async () => {
    setLoading(true);
    try {
      const res = await api.post(
        "/api/auth/change-password",
        {
          oldPassword,
          newPassword,
          confirmNewPassword: confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      if (res.data?.success) {
        showUserMessage("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showUserMessage(res.data?.message || "Password change failed!");
      }
    } catch (err) {
      showUserMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showMessage && (
        <Message text={messageText} onClose={() => setShowMessage(false)} />
      )}
      <DashboardHeader showSearch={true} showBack={true} />
      <div className="px-5 md:px-16 lg:px-32 py-10 flex flex-col gap-10 relative pb-28">
        <h1 className="text-3xl md:text-4xl text-primary font-bold">
          Settings
        </h1>

        {/* Personal Info */}
        <AccordionSection
          title="Personal Information"
          icon={<FaUser size={18} />}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="rounded-full h-20 w-20 sm:h-20 sm:w-20 shrink-0 bg-primary overflow-hidden flex items-center justify-center text-white text-xl">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.name?.[0] ?? "U"
              )}
            </div>
            <button
              className="border rounded-md px-6 py-2 border-gray-500 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => fileInputRef.current?.click()}
            >
              Change Avatar
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <div>
            <label className="dark:text-primary block mt-4 mb-1">
              Full Name
            </label>
            <SecondaryInput
              value={name}
              placeHolder="User's name"
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="dark:text-primary block mt-4 mb-1">Email</label>
            <SecondaryInput
              value={user?.email || ""}
              placeHolder="User's email"
              className="w-full"
              disabled={true}
            />
          </div>
        </AccordionSection>

        {/* Security */}
        <AccordionSection
          title="Security"
          icon={<MdOutlineSecurity size={22} />}
        >
          <div className="dark:text-primary">
            <label className="block mt-4 mb-1">Current Password</label>
            <SecondaryInput
              placeHolder="Your current password"
              className="w-full"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>

          <div className="dark:text-primary">
            <label className="block mt-4 mb-1">New Password</label>
            <SecondaryInput
              placeHolder="New password"
              className="w-full"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="dark:text-primary">
            <label className="block mt-4 mb-1">Confirm Password</label>
            <SecondaryInput
              placeHolder="Confirm your password"
              className="w-full"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <PrimaryButton
              text={loading ? "Changing..." : "Change Password"}
              className="w-fit mt-6"
              action={handleChangePassword}
            />
          </div>
        </AccordionSection>

        {/* Notification Preferences */}
        {/* <AccordionSection
          title="Notification Preferences"
          icon={<IoIosNotifications size={24} />}
        >
          {["System Updates", "Email Notifications"].map((label, idx) => (
            <div
              key={idx}
              className="flex justify-between items-start sm:items-center gap-4 flex-wrap sm:flex-nowrap mt-2"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate sm:whitespace-normal">
                  {label}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 break-words">
                  Receive notifications{" "}
                  {label === "Email Notifications"
                    ? "on your email"
                    : "about system updates"}
                </p>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary dark:peer-checked:bg-primary" />
              </label>
            </div>
          ))}
        </AccordionSection> */}

        {/* Save / Cancel Buttons */}
        <div className="absolute bottom-10 right-5 md:right-16 lg:right-32 flex gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="border rounded-md px-6 py-2 border-gray-500 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <PrimaryButton
            text={isSaving ? "Saving..." : "Save Changes"}
            action={handleSave}
          />
        </div>
      </div>
    </>
  );
};

export default Settings;
