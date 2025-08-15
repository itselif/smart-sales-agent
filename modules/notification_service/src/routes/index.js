const express = require("express");
const router = express.Router();

const notificationRoute = require("./notification.route");
const deviceRoute = require("./device.route");

router.use("/notifications", notificationRoute);
router.use("/devices", deviceRoute);

module.exports = router;
