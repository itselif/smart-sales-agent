const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate");
const { deviceValidation } = require("../validations");

const { catchAsync } = require("../utils");
const { deviceService } = require("../services");

/**
 * @api {post} /register Register Device
 * @apiName RegisterDevice
 * @apiDescription Register a device
 * @apiGroup Device
 * @apiPermission authenticated (only)
 * @apiValidation {saveDevice}
 */
router.route("/register").post(
  validate(deviceValidation.saveDevice),
  catchAsync(async (req, res) => {
    const body = req.body;
    body.userId = req.userId;
    await deviceService.saveDevice(req.body);
    res.status(201).send();
  }),
);

/**
 * @api {delete} /unregister/:deviceId Unregister Device
 * @apiName UnregisterDevice
 * @apiDescription Unregister a device
 * @apiGroup Device
 * @apiPermission authenticated (only)
 * @apiValidation {removeDevice}
 */
router.route("/unregister/:deviceId").delete(
  validate(deviceValidation.removeDevice),
  catchAsync(async (req, res) => {
    await deviceService.removeDevice(req.userId, req.params.deviceId);
    res.status(200).send();
  }),
);

module.exports = router;
