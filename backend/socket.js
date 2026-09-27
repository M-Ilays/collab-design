const { Server } = require("socket.io");
const Discussion = require("./team-discussion/discussion.model");
const Project = require("./project/project.model");

const setupSocket = (server, app) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Replace with frontend URL in production
    },
  });
  app.set("io", io);
  io.on("connection", (socket) => {
    // console.log("A user connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
      
    });

    // Join project room
    socket.on("joinProject", (projectId) => {
      socket.join(projectId);
      // console.log(`User joined project room: ${projectId}`);
    });

    // Handle new message and save it to the database
    socket.on("sendMessage", async (messageData) => {
      const { sender, text, projectId, attachments } = messageData;

      // Save message to DB
      const newMessage = new Discussion({
        sender,
        text,
        projectId,
        attachments: attachments || [], // Ensure attachments are saved
        seenBy: [],
      });
      await newMessage.save();

      // Add message to project's discussions array
      await Project.findByIdAndUpdate(
        projectId,
        { $push: { discussions: newMessage._id } },
        { new: true }
      );

      // Populate sender info before broadcasting
      const populatedMessage = await Discussion.findById(
        newMessage._id
      ).populate("sender", "name");

      // Emit message to all users in the project room
      io.to(projectId).emit("newMessage", populatedMessage);
    });

    socket.on("seenMessage", async ({ messageId, userId, projectId }) => {
      const message = await Discussion.findById(messageId);
      if (!message) return;

      // Check if user is already in seenBy array
      if (!message.seenBy.includes(userId)) {
        message.seenBy.push(userId);
        await message.save();
      }

      // Fetch project members to verify correct count
      const project = await Project.findById(projectId).populate(
        "members",
        "_id"
      );

      // Emit updated message with seen status
      io.to(projectId).emit("messageSeen", {
        messageId,
        seenBy: message.seenBy,
        totalMembers: project.members.length, // Send correct total members count
      });
    });

    // Disconnect
    socket.on("disconnect", () => {
      // console.log("A user disconnected:", socket.id);
    });
  });
};

module.exports = { setupSocket };
