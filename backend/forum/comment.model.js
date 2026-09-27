const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

// debugger;
replySchema.add({ replies: [replySchema] });

const commentSchema = new mongoose.Schema({
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Thread",
    required: true,
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  replies: [replySchema], // Array of replies
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who liked
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who disliked
});

module.exports = mongoose.model("Comment", commentSchema);
