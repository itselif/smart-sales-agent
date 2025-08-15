const Joi = require("joi");

const saveDevice = {
  body: Joi.object().keys({
    deviceId: Joi.string().required(),
    notificationToken: Joi.string().required(),
    os: Joi.string().valid("IOS", "ANDROID", "WEB").required(),
    osVersion: Joi.string(),
    osModel: Joi.string(),
  }),
};

const removeDevice = {
  params: Joi.object().keys({
    deviceId: Joi.string().required(),
  }),
};

module.exports = {
  saveDevice,
  removeDevice,
};
