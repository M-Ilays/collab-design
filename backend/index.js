const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const path = require("path");
const http = require("http");
const { setupSocket } = require("./socket");

require("dotenv").config();

const auth = require("./auth/auth.controller");
const user = require("./user/user.controller");
const project = require("./project/project.controller");
const requirement = require("./requirements/requirement.controller");
const discussionRoutes = require("./team-discussion/discussion.routes");
const forum = require("./forum/forum.controller");
const diagram = require("./diagram/diagram.controller");
const invitations = require("./project/invitation/invitation.controller");
const notificationRoutes = require("./notification/notification.controller");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

//Passport
app.use(
  session({
    secret: process.env.PASSPORT_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", auth);
app.use("/api/user", user);
app.use("/api/project", project);
app.use("/api/req", requirement);
app.use("/api/discussions", discussionRoutes);
app.use("/api/forum", forum);
app.use("/api/diagram", diagram);
app.use("/api/invitations", invitations);
app.use("/api/notifications", notificationRoutes);

// MongoDB Connection
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

// Connect to MongoDB
connectToMongoDB();

// Setup Socket.io
setupSocket(server, app);

// Start Server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
