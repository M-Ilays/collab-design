const express = require("express");
const jwt = require("../middleware/jwt"); // Ensure correct import
const Thread = require("./thread.model");
const Comment = require("./comment.model");
const User = require("../user/user.model"); // Import User model
const router = express.Router();
const fs = require("fs"); // Import File System module
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose"); // Import mongoose for ObjectId

const uploadDir = "uploads/threads/";

// Ensure directory exists before saving files
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Create directories if they don't exist
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files in the correct directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// DELETE a thread (Author Only)
router.delete("/:id", jwt, async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: "Thread not found" });

    // Only allow deletion if user is the thread author
    if (thread.author.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this thread" });
    }

    await Thread.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ thread: req.params.id }); // Delete associated comments

    res.json({ message: "Thread deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// TOGGLE thread status (Close/Open) (Author Only)
router.put("/:id/close", jwt, async (req, res) => {
  try {
    console.log(
      "Thread Status Toggle Request:",
      req.params.id,
      "by User:",
      req.user.userId
    );

    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      console.log("Thread not found");
      return res.status(404).json({ message: "Thread not found" });
    }

    // Only allow toggling if user is the thread author
    if (thread.author.toString() !== req.user.userId) {
      console.log("Unauthorized: User is not the thread author");
      return res
        .status(403)
        .json({ message: "Unauthorized to modify this thread" });
    }

    // Toggle status between 'active' and 'closed'
    thread.status = thread.status === "closed" ? "active" : "closed";
    await thread.save();

    console.log(`Thread status updated to '${thread.status}'`);
    res.json({
      message: `Thread status changed to '${thread.status}'`,
      thread,
    });
  } catch (error) {
    console.error("Error toggling thread status:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST a new thread (requires login)
router.post("/", jwt, upload.array("files"), async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const files = req.files ? req.files.map((file) => file.path) : [];

    const newThread = new Thread({
      author: req.user.userId,
      title,
      content,
      tags,
      files,
    });

    await newThread.save();

    const populatedThread = await Thread.findById(newThread._id).populate(
      "author",
      "id name profilePicture"
    );

    res.status(201).json(populatedThread);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all threads (public)
router.get("/", async (req, res) => {
  try {
    console.log("Get threads")
    const threads = await Thread.find().populate(
      "author",
      "id name profilePicture"
    );
    res.json(threads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper: Recursively populate author in all nested replies
async function populateReplyAuthors(replies) {
  for (let reply of replies) {
    if (reply.author && reply.author instanceof mongoose.Types.ObjectId) {
      reply.author = await User.findById(reply.author).select("id name profilePicture");
    }
    if (reply.replies && reply.replies.length > 0) {
      await populateReplyAuthors(reply.replies);
    }
  }
}

// GET single thread and increment view count
router.get("/:id", async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id)
      .populate("author", "id name profilePicture")
      .populate({
        path: "comments",
        populate: { path: "author", select: "id name profilePicture" },
      });

    if (!thread) return res.status(404).json({ message: "Thread not found" });

    // Recursively populate all reply authors
    for (let comment of thread.comments) {
      await populateReplyAuthors(comment.replies);
    }

    thread.views += 1;
    await thread.save();

    res.json(thread);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a comment (requires login)
router.post("/:id/comment", jwt, async (req, res) => {
  try {
    const { content, parentCommentId } = req.body;
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: "Thread not found" });

    const newComment = new Comment({
      thread: thread._id,
      author: req.user.userId,
      content,
      parentComment: parentCommentId || null, // Allow replies
    });

    await newComment.save();

    thread.comments.push(newComment._id);
    await thread.save();

    const populatedComment = await Comment.findById(newComment._id).populate(
      "author",
      "id name profilePicture"
    );

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPVOTE a thread (requires login)
router.post("/:id/upvote", jwt, async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: "Thread not found" });
    
    const userId = req.user.userId;
    const alreadyUpvoted = thread.likes.includes(userId);

    if (alreadyUpvoted) {
      thread.likes = thread.likes.filter(id => id.toString() !== userId);
      await thread.save();
      const updatedThread = await Thread.findById(req.params.id).populate("author", "id name profilePicture");
      return res.json({ message: "Upvote removed!", thread: updatedThread, upvoted: false });
    } else {
      thread.likes.push(userId);
      await thread.save();
      const updatedThread = await Thread.findById(req.params.id).populate("author", "id name profilePicture");
      return res.json({ message: "Upvoted!", thread: updatedThread, upvoted: true });
    }
    
    // if (!thread.likes.includes(req.user.userId)) {
    //   thread.likes.push(req.user.userId);
    //   await thread.save();
    //   const updatedThread = await Thread.findById(req.params.id).populate(
    //     "author",
    //     "id name profilePicture"
    //   );
    //   return res.json({ message: "Upvoted!", thread: updatedThread });
    // } else {
    //   return res.status(400).json({ message: "Already upvoted!" });
    // }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a reply to a comment
router.post("/:threadId/comment/:commentId/reply", jwt, async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Create new reply object
    const newReply = {
      author: req.user.userId,
      content,
      createdAt: new Date(),
    };

    // Push reply to comment's replies array
    comment.replies.push(newReply);
    await comment.save();

    // Populate the newly added reply's author details
    const populatedReply = await comment.populate({
      path: "replies.author",
      select: "id name profilePicture",
    });

    // Get the latest reply (the one just added)
    const latestReply =
      populatedReply.replies[populatedReply.replies.length - 1];

    res.status(201).json({ message: "Reply added!", reply: latestReply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like a comment
router.post("/:threadId/comment/:commentId/like", jwt, async (req, res) => {
  try {
    const { threadId, commentId } = req.params;

    // Ensure the thread exists
    const thread = await Thread.findById(threadId);
    if (!thread) return res.status(404).json({ message: "Thread not found" });

    // Find the comment in the thread
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Remove from dislikes if user previously disliked
    comment.dislikes = comment.dislikes.filter(
      (id) => id.toString() !== req.user.userId
    );

    // Toggle like
    if (comment.likes.includes(req.user.userId)) {
      comment.likes = comment.likes.filter(
        (id) => id.toString() !== req.user.userId
      );
    } else {
      comment.likes.push(req.user.userId);
    }

    await comment.save();
    res.json({
      message: "Like updated",
      likes: comment.likes,
      dislikes: comment.dislikes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dislike a comment
router.post("/:threadId/comment/:commentId/dislike", jwt, async (req, res) => {
  try {
    const { threadId, commentId } = req.params;

    // Ensure the thread exists
    const thread = await Thread.findById(threadId);
    if (!thread) return res.status(404).json({ message: "Thread not found" });

    // Find the comment in the thread
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Remove from likes if user previously liked
    comment.likes = comment.likes.filter(
      (id) => id.toString() !== req.user.userId
    );

    // Toggle dislike
    if (comment.dislikes.includes(req.user.userId)) {
      comment.dislikes = comment.dislikes.filter(
        (id) => id.toString() !== req.user.userId
      );
    } else {
      comment.dislikes.push(req.user.userId);
    }

    await comment.save();
    res.json({
      message: "Dislike updated",
      likes: comment.likes,
      dislikes: comment.dislikes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper: Recursively find a reply by ID in a replies array
function findReplyById(replies, replyId) {
  for (let reply of replies) {
    if (reply._id.toString() === replyId) return reply;
    if (reply.replies && reply.replies.length > 0) {
      const found = findReplyById(reply.replies, replyId);
      if (found) return found;
    }
  }
  return null;
}

// Like a reply (any depth)
router.post("/:threadId/comment/:commentId/reply/:replyId/like", jwt, async (req, res) => {
  try {
    const { threadId, commentId, replyId } = req.params;
    const thread = await Thread.findById(threadId);
    if (!thread) return res.status(404).json({ message: "Thread not found" });
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    const reply = findReplyById(comment.replies, replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });
    // Remove from dislikes if user previously disliked
    reply.dislikes = reply.dislikes.filter(
      (id) => id.toString() !== req.user.userId
    );
    // Toggle like
    if (reply.likes.includes(req.user.userId)) {
      reply.likes = reply.likes.filter(
        (id) => id.toString() !== req.user.userId
      );
    } else {
      reply.likes.push(req.user.userId);
    }
    await comment.save();
    res.json({
      message: "Reply like updated",
      likes: reply.likes,
      dislikes: reply.dislikes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dislike a reply (any depth)
router.post("/:threadId/comment/:commentId/reply/:replyId/dislike", jwt, async (req, res) => {
  try {
    const { threadId, commentId, replyId } = req.params;
    const thread = await Thread.findById(threadId);
    if (!thread) return res.status(404).json({ message: "Thread not found" });
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    const reply = findReplyById(comment.replies, replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });
    // Remove from likes if user previously liked
    reply.likes = reply.likes.filter(
      (id) => id.toString() !== req.user.userId
    );
    // Toggle dislike
    if (reply.dislikes.includes(req.user.userId)) {
      reply.dislikes = reply.dislikes.filter(
        (id) => id.toString() !== req.user.userId
      );
    } else {
      reply.dislikes.push(req.user.userId);
    }
    await comment.save();
    res.json({
      message: "Reply dislike updated",
      likes: reply.likes,
      dislikes: reply.dislikes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reply to a reply (any depth)
router.post("/:threadId/comment/:commentId/reply/:replyId/reply", jwt, async (req, res) => {
  try {
    const { content } = req.body;
    const { threadId, commentId, replyId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    const reply = findReplyById(comment.replies, replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });
    // Create new nested reply
    const newReply = {
      author: req.user.userId,
      content,
      createdAt: new Date(),
      likes: [],
      dislikes: [],
      replies: [],
    };
    if (!reply.replies) reply.replies = [];
    reply.replies.push(newReply);
    await comment.save();
    // Recursively populate all reply authors
    await populateReplyAuthors(comment.replies);
    // Find the new reply in the updated comment
    const findNewReply = (replies) => {
      for (let r of replies) {
        if (r.replies && r.replies.length > 0) {
          const found = findNewReply(r.replies);
          if (found) return found;
        }
        if (
          r.content === newReply.content &&
          r.author && r.author._id.toString() === req.user.userId &&
          Math.abs(new Date(r.createdAt) - newReply.createdAt) < 1000
        ) {
          return r;
        }
      }
      return null;
    };
    const latestReply = findNewReply(comment.replies);
    res.status(201).json({ message: "Nested reply added!", reply: latestReply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
