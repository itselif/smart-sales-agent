const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate");
const { notificationValidation } = require("../validations");

const { catchAsync } = require("../utils");
const { notificationService } = require("../services");

/**
 * @api {get} /notifications Get Notifications
 * @apiName GetNotifications
 * @apiDescription Get all notifications
 * @apiGroup Notification
 * @apiPermission authenticated (only)
 * @apiValidation {getNotifications}
 */
router
  .route("/")
  .get(
    validate(notificationValidation.getNotifications),
    catchAsync(async (req, res) => {
      const notifications = await notificationService.getNotifications(
        req.userId,
        req.query.sortBy,
        req.query.page,
        req.query.limit,
      );
      res.send(notifications);
    }),
  )
  /**
   * @api {post} /notifications Send Notification
   * @apiName SendNotification
   * @apiDescription Send notification
   * @apiGroup Notification
   * @apiPermission authenticated (only)
   * @apiValidation {sendNotification}
   */
  .post(
    validate(notificationValidation.sendNotification),
    catchAsync(async (req, res) => {
      await notificationService.sendNotification(req.body);
      res.status(201).send();
    }),
  );

/**
 * @api {post} /notifications/seen Seen Notifications
 * @apiName SeenNotifications
 * @apiDescription Mark notifications as seen
 * @apiGroup Notification
 * @apiPermission authenticated (only)
 * @apiValidation {seenNotification}
 */
router.route("/seen").post(
  validate(notificationValidation.seenNotification),
  catchAsync(async (req, res) => {
    await notificationService.seenNotifications(
      req.userId,
      req.body.notificationIds,
    );
    res.status(200).send();
  }),
);

module.exports = router;
