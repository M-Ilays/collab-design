const multer = require("multer");
const path = require("path");
const Project = require("../project.model");
const User = require("../../user/user.model");
const Invitation = require("../invitation/invitation.model");
const { sendEmail } = require("../../shared/mail.service");
const crypto = require("crypto");

// Storage and file filter setup remains the same
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/projects"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed."));
  }
};

const upload = multer({ storage, fileFilter });

const createProject = async (req, res) => {
  const { name, description, members = [] } = req.body;

  try {
    // Handle uploaded file
    const projectImage =
      req.file && req.file.filename
        ? `/uploads/projects/${req.file.filename}`
        : "default_project.jpg";

    // Step 1: Create the project with empty members array
    const project = new Project({
      name,
      description,
      projectImage,
      owner: req.user.userId,
      members: [], // Start with empty members array
    });

    await project.save();

    // Step 2: Process invitations for each member email
    const inviter = await User.findById(req.user.userId);
    const invitationResults = [];

    for (const email of members) {
      try {
        // Skip if email is empty or same as owner's email
        if (!email || email === inviter.email) {
          invitationResults.push({
            email,
            status: "skipped",
            message: "Cannot invite project owner or empty email",
          });
          continue;
        }

        const existingUser = await User.findOne({ email });

        // Check if user is already a member (though array should be empty for new project)
        if (existingUser && project.members.includes(existingUser._id)) {
          invitationResults.push({
            email,
            status: "already_member",
            message: "User is already a member",
          });
          continue;
        }

        // Check for existing pending invitation
        const existingInvite = await Invitation.findOne({
          project: project._id,
          inviteeEmail: email,
          status: "Pending",
        });

        if (existingInvite) {
          invitationResults.push({
            email,
            status: "invite_pending",
            message: "Invitation already sent to this email",
          });
          continue;
        }

        // Create invitation token
        const token = crypto.randomBytes(32).toString("hex");

        // Create new invitation
        const invitation = new Invitation({
          project: project._id,
          inviter: req.user.userId,
          inviteeEmail: email,
          token,
        });

        await invitation.save();

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

        invitationResults.push({
          email,
          status: "invite_sent",
          message: "Invitation sent successfully",
          isRegistered: !!existingUser,
        });
      } catch (error) {
        invitationResults.push({
          email,
          status: "error",
          message: error.message,
        });
      }
    }

    // Step 3: Respond with the created project and invitation results
    res.status(201).json({
      success: true,
      project,
      invitations: invitationResults,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createProject, upload };
