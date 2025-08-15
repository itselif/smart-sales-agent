const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");

const { db } = require("../models");
const { deviceToken: DeviceToken } = db;

/**
 * Save a device token
 * @param {Object} deviceTokenBody
 * @returns {Promise<DeviceToken>}
 */
const saveDevice = async (deviceTokenBody) => {
  const checkDevice = await DeviceToken.findOne({
    where: {
      userId: deviceTokenBody.userId,
      deviceId: deviceTokenBody.deviceId,
    },
  });

  if (checkDevice) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Device already registered");
  }

  const deviceToken = await DeviceToken.create(deviceTokenBody);
  return deviceToken;
};

/**
 * Remove device token
 * @param {string} userId
 * @param {string} deviceId
 * @returns {Promise<void>}
 */
const removeDevice = async (userId, deviceId) => {
  const deviceToken = await DeviceToken.findOne({
    where: {
      userId,
      deviceId,
    },
  });

  if (!deviceToken) {
    throw new ApiError(httpStatus.NOT_FOUND, "Device not found");
  }

  await deviceToken.destroy();
};

module.exports = {
  saveDevice,
  removeDevice,
};
