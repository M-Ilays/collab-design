const express = require("express");
const router = express.Router();
const { getNotifications, markAllAsSeen } = require("./notification.service");
const jwt = require("../middleware/jwt");

// You may want to add authentication middleware here
router.get("/",jwt,  getNotifications);
router.post("/markAllAsSeen",jwt, markAllAsSeen);

module.exports = router;