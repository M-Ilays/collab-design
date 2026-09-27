import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import VersionCard from "./VersionCard";
import ShimmerCard from "./ShimmerCard";
import PrimaryButton from "../../../utils/Buttons/PrimaryButton";
import PrimaryModal from "../../../utils/Modals/PrimaryModal";
import SecondaryInput from "../../../utils/Inputs/SecondaryInput";
import { useParams } from "react-router-dom";
import api from "../../../api";
import Message from "../../../overlays/Message";

const VersionSlider = ({
  versions,
  isLoading,
  onClose,
  onVersionClick,
  fetchVersions,
}) => {
  const [message, setMessage] = useState(null);
  const { id } = useParams();
  const isEmpty = !versions || versions.length === 0;
  const modalRef = useRef();
  const isDesktop = window.innerWidth >= 768;

  // Modal state
  const [showNewVersionModal, setShowNewVersionModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !showNewVersionModal &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const getInitialAnimation = () =>
    isDesktop ? { x: "100%", opacity: 0 } : { y: "100%", opacity: 0 };

  const getAnimate = () => ({ x: 0, y: 0, opacity: 1 });

  const handleCreateVersion = async () => {
    if (!name.trim()) {
      setNameError("Name is required");
      return;
    }

    try {
      const res = await api.post(`/api/project/${id}/saveVersion`, {
        name,
        description,
      });

      setMessage(res.data?.message || "Version saved successfully.");

      // Refresh version list:
      if (fetchVersions) {
        await fetchVersions();
      }

      // Reset form
      setName("");
      setDescription("");
      setNameError("");
      setShowNewVersionModal(false);
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while saving the version.");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex">
        {/* Dark overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-black"
        />

        {/* Slide-in panel */}
        <motion.div
          ref={modalRef}
          initial={getInitialAnimation()}
          animate={getAnimate()}
          exit={getInitialAnimation()}
          transition={{ type: "spring", stiffness: 50, damping: 10 }}
          className={`
            absolute bg-white dark:bg-dark transition-colors duration-200 z-50 shadow-lg p-4
            overflow-y-auto
            md:top-0 md:right-0 md:h-full md:w-[400px] md:rounded-l-md
            bottom-0 w-full h-1/2 rounded-t-md
          `}
        >
          <div className="flex justify-between items-center pt-2 pb-4">
            <h1 className="text-primary text-2xl font-semibold">
              Previous Versions
            </h1>
            <PrimaryButton
              text={"+ New version"}
              action={() => setShowNewVersionModal(true)}
            />
          </div>

          <div className="flex flex-col gap-4">
            {isLoading ? (
              Array(4)
                .fill(0)
                .map((_, i) => <ShimmerCard key={i} />)
            ) : isEmpty ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="text-gray-400 dark:text-gray-600 mb-2">
                  <svg
                    className="w-12 h-12 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-1">
                  No versions yet
                </h3>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Create your first version to get started
                </p>
              </div>
            ) : (
              versions.map((v, i) => (
                <VersionCard onClick={onVersionClick} key={i} version={v} />
              ))
            )}
          </div>
          {message && (
            <Message text={message} onClose={() => setMessage(null)} />
          )}
          {showNewVersionModal && (
            <PrimaryModal
              heading="Create New Version"
              buttonText="Create"
              onClose={() => {
                setShowNewVersionModal(false);
                setNameError("");
              }}
              onSubmit={handleCreateVersion}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Version Name <span className="text-red-500">*</span>
                </label>
                <SecondaryInput
                  value={name}
                  className="w-full"
                  placeHolder="Enter version name"
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError("");
                  }}
                  isRequired
                  error={nameError}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Description (optional)
                </label>
                <SecondaryInput
                  className="w-full"
                  value={description}
                  placeHolder="Enter description"
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </PrimaryModal>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default VersionSlider;
