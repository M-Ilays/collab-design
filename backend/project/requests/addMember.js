const Project = require("../project.model");
const User = require("../../user/user.model");
const Invitation = require("../invitation/invitation.model");
const { sendEmail } = require("../../shared/mail.service");
const crypto = require("crypto");

const addMember = async (req, res) => {
  const { projectId, email } = req.body;
  const inviterId = req.user.userId; // Assuming JWT middleware adds user to req

  try {
    if (!projectId || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    // Check if user is already a member
    const existingUser = await User.findOne({ email });
    if (existingUser && project.members.includes(existingUser._id)) {
      return res.status(400).json({
        success: false,
        message: "User is already a member",
      });
    }

    // Check for existing pending invitation
    const existingInvite = await Invitation.findOne({
      project: projectId,
      inviteeEmail: email,
      status: "Pending",
    });

    if (existingInvite) {
      return res.status(400).json({
        success: false,
        message: "Invitation already sent to this email",
      });
    }

    // Create invitation token
    const token = crypto.randomBytes(32).toString("hex");

    // Create new invitation
    const invitation = new Invitation({
      project: projectId,
      inviter: inviterId,
      inviteeEmail: email,
      token,
    });

    await invitation.save();

    // Get inviter details
    const inviter = await User.findById(inviterId);

    // Send invitation email
    const acceptLink = `${process.env.BACKEND_URL}/api/invitations/accept?token=${token}`;
    const rejectLink = `${process.env.BACKEND_URL}/api/invitations/reject?token=${token}`;

    await sendEmail(
      `Invitation to join project: ${project.name}`,
      "./project/mails/projectInvitation.html",
      email,
      {
        projectName: project.name,
        inviterName: inviter.name,
        acceptLink,
        rejectLink,
        registerLink: `${process.env.FRONT_APP_URL_DEV}/?invite=${token}`,
        isRegistered: !!existingUser,
      }
    );

    res.status(200).json({
      success: true,
      message: "Invitation sent successfully",
      isRegistered: !!existingUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = addMember;
