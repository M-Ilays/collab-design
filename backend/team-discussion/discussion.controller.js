const Discussion = require("./discussion.model");
const Project = require("../project/project.model"); // Import Project model

// Send Message (API + Save to DB + Link to Project)
const sendMessage = async (req, res) => {
  try {
    const { sender, text, projectId } = req.body;
    const attachments = req.files ? req.files.map((file) => file.path) : [];
    const messageType =
      attachments.length > 0
        ? attachments[0].endsWith(".jpg") ||
          attachments[0].endsWith(".png") ||
          attachments[0].endsWith(".gif")
          ? "image"
          : "file"
        : "text";

    const newMessage = new Discussion({
      sender,
      text,
      projectId,
      attachments,
      messageType,
      seenBy: [],
    });

    await newMessage.save();

    await Project.findByIdAndUpdate(
      projectId,
      { $push: { discussions: newMessage._id } },
      { new: true }
    );

    const populatedMessage = await Discussion.findById(newMessage._id).populate(
      "sender",
      "name"
    );

    req.io.to(projectId).emit("newMessage", populatedMessage);
    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Get Messages for a Project
const getMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const messages = await Discussion.find({ projectId }).populate(
      "sender",
      "name"
    );
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Mark Message as Seen
const markAsSeen = async (req, res) => {
  try {
    const { messageId, userId } = req.body;
    const message = await Discussion.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (!message.seenBy.includes(userId)) {
      message.seenBy.push(userId);
      await message.save();
    }

    res.status(200).json({ message: "Message marked as seen" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { sendMessage, getMessages, markAsSeen };
