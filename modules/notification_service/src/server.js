const grpc = require("@grpc/grpc-js");
const notificationSenderService = require("./grpc/notification.sender.service");

const grpcServer = new grpc.Server();
const grpcPort = `0.0.0.0:${process.env.GRPC_PORT || 50051}`;

grpcServer.addService(
  notificationSenderService.service,
  notificationSenderService.handles,
);

module.exports = {
  startGrpc: () => {
    grpcServer.bindAsync(
      grpcPort,
      grpc.ServerCredentials.createInsecure(),
      (err, port) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(`gRPC server is listening on ${port}`);
        grpcServer.start();
      },
    );
  },
  closeGrpc: () => {
    grpcServer.forceShutdown();
  },
};
