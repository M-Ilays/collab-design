const Invitation = require("./invitation.model");
const Project = require("../project.model");
const User = require("../../user/user.model");
const express = require("express");
const router = express.Router();
const Notification = require("../../notification/notification.model");

const acceptInvitation = async (req, res) => {
  try {
    const { token } = req.query;

    const invitation = await Invitation.findOne({ token });
    if (!invitation) {
      return res
        .status(404)
        .json({ success: false, message: "Invitation not found" });
    }

    if (invitation.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Invitation already processed",
      });
    }

    // Find user by email (they might have registered after invitation was sent)
    const user = await User.findOne({ email: invitation.inviteeEmail });
    if (!user) {
      return res.redirect(`${process.env.FRONT_APP_URL_DEV}/?invite=${token}`);
    }

    // Add user to project
    const project = await Project.findById(invitation.project);
    if (!project.members.includes(user._id)) {
      project.members.push(user._id);
      await project.save();
    }

    // Collect all recipients: members + owner (no duplicates, no self)
    const allRecipients = [
      ...project.members.map(id => id.toString()),
      project.owner.toString()
    ];

    // Remove duplicates and the user who accepted
    const uniqueRecipients = [...new Set(allRecipients)].filter(
      id => id !== user._id.toString()
    );

    console.log("All recipients (owner + members, no self):", uniqueRecipients);

    const notificationPromises = uniqueRecipients.map(memberId => {
      const notif = new Notification({
        recipient: memberId,
        project: project._id,
        type: "invitation_accepted",
        message: `${user.name} has joined the ${project.name}.`,
      });
      return notif.save()
        .then(() => {
          console.log("Notification saved for:", memberId);
        })
        .catch(err => {
          console.error("Error saving notification for", memberId, err);
        });
    });

    await Promise.all(notificationPromises);

    // Emit socket event to all recipients
    const io = req.app.get("io");
    if (!io) {
      console.error("Socket.io instance not found on app!");
    } else {
      uniqueRecipients.forEach(memberId => {
        io.to(memberId).emit("newNotification", {
          projectId: project._id,
          message: `${user.name} has joined the project.`,
          type: "invitation_accepted"
        });
      });
    }

    // Update invitation status
    invitation.status = "Accepted";
    await invitation.save();

    // Redirect to frontend with success message
    return res.redirect(`${process.env.FRONT_APP_URL_DEV}`);
  } catch (error) {
    console.error("Error in acceptInvitation:", error);
    return res.redirect(`${process.env.FRONT_APP_URL_DEV}`);
  }
};

const rejectInvitation = async (req, res) => {
  try {
    const { token } = req.query;

    const invitation = await Invitation.findOne({ token });
    if (!invitation) {
      // For API calls
      if (req.accepts("json")) {
        return res.status(404).json({
          success: false,
          message: "Invitation not found",
        });
      }
      // For browser clicks
      return res.send(`
          <html>
            <body>
              <script>
                alert("Invitation not found or already expired");
                window.close();
              </script>
            </body>
          </html>
        `);
    }

    if (invitation.status !== "Pending") {
      if (req.accepts("json")) {
        return res.status(400).json({
          success: false,
          message: "Invitation already processed",
        });
      }
      return res.send(`
          <html>
            <body>
              <script>
                alert("This invitation was already processed");
                window.close();
              </script>
            </body>
          </html>
        `);
    }

    // Update invitation status
    invitation.status = "Rejected";
    await invitation.save();

    // Different responses based on content type
    if (req.accepts("json")) {
      return res.json({ success: true, message: "Invitation rejected" });
    }

    // For browser - show confirmation and close
    return res.send(`
        <html>
          <body>
            <script>
              alert("You have declined the invitation");
              window.close();
            </script>
          </body>
        </html>
      `);
  } catch (error) {
    if (req.accepts("json")) {
      return res.status(500).json({
        success: false,
        message: "Error processing rejection",
      });
    }
    return res.send(`
        <html>
          <body>
            <script>
              alert("Error processing your request");
              window.close();
            </script>
          </body>
        </html>
      `);
  }
};

router.get("/accept", acceptInvitation);
router.get("/reject", rejectInvitation);

module.exports = router;
