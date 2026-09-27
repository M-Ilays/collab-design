import { useState, useEffect } from "react";
import SecondaryInput from "../../../utils/Inputs/SecondaryInput";
import PrimaryButton from "../../../utils/Buttons/PrimaryButton";
import PrimaryModal from "../../../utils/Modals/PrimaryModal";
import TeamMemberCard from "./TeamMemberCard";
import { useAuth } from "../../../contexts/AuthContext";
import api from "../../../api";
import Message from "../../../overlays/Message";
import PendingInviteCard from "./PendingInviteCard";
import ConfirmationPrompt from "../../../overlays/ConfirmationPrompt";
import PropTypes from "prop-types";

const TeamTabDetail = ({
  pendingInvites = [],
  team = [],
  projectId,
  owner,
  refreshProject,
  projectStatus,
}) => {
  const { user } = useAuth();
  const [modal, setModal] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [filteredInvites, setFilteredInvites] = useState([]);
  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");
  const [apiMessage, setApiMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentInviteId, setCurrentInviteId] = useState(null);

  useEffect(() => {
    // Include the owner in the team members array
    const allMembers = [...team, { ...owner, isOwner: true }];
    setTeamMembers(allMembers);
    setFilteredMembers(allMembers);
    setFilteredInvites(pendingInvites || []); 
  }, [team, owner, pendingInvites]);

  const openModal = () => {
    setModal(true);
    setEmailError("");
    setNameError("");
    setEmail("");
    setName("");
  };

  const closeModal = () => {
    setModal(false);
    setEmailError("");
    setNameError("");
    setEmail("");
    setName("");
  };

  const handleAddMember = async () => {
    setEmailError("");
    setNameError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Invalid email format");
      return;
    }

    try {
      const response = await api.post(
        "/api/project/add-member",
        { projectId, email },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (response.data.success) {
        setApiMessage(response.data.message); // Set the API message
        setShowMessage(true); // Show the message
        closeModal(); // Close the modal
        refreshProject(); // Refresh project data from server
      } else {
        console.log("error is else ", response.data.message);
        setEmailError(response.data.message);
      }
    } catch (error) {
      console.log("error is catch", error.message);
      setEmailError("Failed to add member. Please try again.");
      console.error(error);
    }
  };

  const handleCancelInvite = async () => {
    try {
      const response = await api.delete(
        `/api/project/cancel-invite/${currentInviteId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (response.data.success) {
        setApiMessage(
          response.data.message || "Invitation cancelled successfully"
        );
        setShowMessage(true);
        refreshProject();
      } else {
        setApiMessage(response.data.message || "Failed to cancel invitation");
        setShowMessage(true);
        refreshProject();
      }
    } catch (error) {
      let errorMessage = "Failed to cancel invitation";
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = "No response from server";
      } else {
        errorMessage = error.message;
      }
      setApiMessage(errorMessage);
      setShowMessage(true);
      refreshProject();
      console.error(error);
    } finally {
      setShowConfirmation(false);
      setCurrentInviteId(null);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);

    if (!query) {
      setFilteredMembers(teamMembers);
      setFilteredInvites(pendingInvites);
    } else {
      // Filter members
      const filteredMembers = teamMembers.filter((member) =>
        member.name.toLowerCase().includes(query)
      );
      setFilteredMembers(filteredMembers);

      // Filter invites
      const filteredInvites = pendingInvites.filter((invite) =>
        invite.inviteeEmail.toLowerCase().includes(query)
      );
      setFilteredInvites(filteredInvites);
    }
  };

  return (
    <>
      {showMessage && (
        <Message text={apiMessage} onClose={() => setShowMessage(false)} />
      )}

      {showConfirmation && (
        <ConfirmationPrompt
          text="Are you sure you want to cancel this invitation?"
          onConfirm={handleCancelInvite}
          onCancel={() => {
            setShowConfirmation(false);
            setCurrentInviteId(null);
          }}
          onConfirmClassName="bg-[#dc2626] hover:bg-red-800"
        />
      )}

      <section className="pt-6 rounded-md bg-white dark:bg-dark px-4">
        {showMessage && (
          <Message text={apiMessage} onClose={() => setShowMessage(false)} />
        )}
        <div className="flex-col-reverse gap-y-3 md:gap-y-0 md:flex-row flex justify-between md:items-center mb-4">
          {projectStatus == "Active" && owner?._id == user.id && (
            <PrimaryButton
              text={"+ Add New Member"}
              className={"w-fit"}
              action={openModal}
            />
          )}
          {projectStatus != "Active" || owner?._id == user.id || <div></div>}
          <div className="flex items-center space-x-3">
            <SecondaryInput
              className={"w-full"}
              placeHolder={"Search members..."}
              value={search}
              onChange={handleSearch}
            />
          </div>
        </div>

        {/* Team Members Section */}
        <div className="space-y-4">
          {filteredInvites.length > 0 && owner._id === user.id && (
            <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
              Team Members
            </h3>
          )}
          {filteredMembers.map((member, index) => (
            <TeamMemberCard
              refreshProject={refreshProject}
              key={member._id || index}
              Name={member.name}
              IsOwner={member.isOwner || false}
              MemberId={member._id}
              projectId={projectId}
              OwnerId={owner?._id}
              isLast={index === filteredMembers.length - 1}
            />
          ))}
        </div>

        {/* Pending Invites Section */}
        {filteredInvites.length > 0 && owner._id === user.id && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
              Invited Members
            </h3>
            <div className="space-y-4">
              {filteredInvites.map((invite, index) => (
                <PendingInviteCard
                  key={invite._id}
                  email={invite.inviteeEmail}
                  invitedAt={new Date(invite.createdAt).toLocaleDateString()}
                  onCancel={() => {
                    setCurrentInviteId(invite._id);
                    setShowConfirmation(true);
                  }}
                  canCancel={
                    owner._id === user.id && projectStatus === "Active"
                  }
                  isLast={index === filteredInvites.length - 1}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Modal (keep existing modal code) */}
      {modal && (
        <PrimaryModal
          onClose={closeModal}
          heading="Add Member"
          buttonText="Add"
          onSubmit={handleAddMember}
        >
          <div className="flex flex-col gap-2">
            <label className="text-base text-[#333333] dark:text-white font-semibold">
              Email
            </label>
            <SecondaryInput
              placeHolder={"Enter member's email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
            />
          </div>
        </PrimaryModal>
      )}
    </>
  );
};

TeamTabDetail.propTypes = {
  pendingInvites: PropTypes.array,
  team: PropTypes.array,
  projectId: PropTypes.string.isRequired,
  owner: PropTypes.object.isRequired,
  refreshProject: PropTypes.func.isRequired,
  projectStatus: PropTypes.string.isRequired,
};

export default TeamTabDetail;
