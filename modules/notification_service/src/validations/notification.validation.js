const Joi = require("joi");

const getNotifications = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer().default(10),
    page: Joi.number().integer().default(1),
  }),
};

const sendNotification = {
  body: Joi.object().keys({
    types: Joi.array()
      .items(Joi.string().valid("sms", "email", "push"))
      .required(),
    template: Joi.string()
      .valid("NONE", "WELCOME", "RESETPASSWORD", "OTP")
      .required(),
    userId: Joi.string().guid().required(),
    email: Joi.string()
      .email()
      .when("types", {
        is: Joi.array().items(Joi.string().valid("email")),
        then: Joi.required(),
      }),
    phoneNumber: Joi.string().when("types", {
      is: Joi.array().items(Joi.string().valid("sms")),
      then: Joi.required(),
    }),
    title: Joi.string().required(),
    body: Joi.string(),
    isStored: Joi.boolean().required(),
    metadata: Joi.object(),
  }),
};

const seenNotification = {
  body: Joi.object().keys({
    notificationIds: Joi.array().items(Joi.string().guid()).required(),
  }),
};

module.exports = {
  getNotifications,
  sendNotification,
  seenNotification,
};
