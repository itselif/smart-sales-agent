const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const { notificationService } = require("../services");

const PROTO_PATH = path.join(
  __dirname,
  "..",
  "protos",
  "notification.sender.proto",
);

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const notificationSenderProto =
  grpc.loadPackageDefinition(packageDefinition).notification;

const sendNotice = async (call, callback) => {
  await notificationService.sendNotification(call.request);
  callback(null, { message: "Notification sent successfully" });
};

module.exports = {
  service: notificationSenderProto.NotificationSenderService.service,
  handles: {
    sendNotice,
  },
};
