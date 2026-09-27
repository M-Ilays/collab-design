const Notification = require("./notification.model");

// Get all notifications for the logged-in user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// Mark all notifications as seen for the logged-in user
const markAllAsSeen = async (req, res) => {
  try {
    const userId = req.user.userId;
    await Notification.updateMany({ recipient: userId, seen: false }, { $set: { seen: true } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark notifications as seen" });
  }
};

module.exports = { getNotifications, markAllAsSeen };