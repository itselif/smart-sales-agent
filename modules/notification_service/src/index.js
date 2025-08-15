const env = process.env.NODE_ENV ?? "prod";
require("dotenv").config({ path: `.${env}.env` });

const app = require("./app");
const { startGrpc, closeGrpc } = require("./server");

const startListener = require("./listeners");
const { startCronJobs } = require("./jobs");

const startMapping = require("./mappings");

const { connectToRedis } = require("./utils/redis.client");
const databaseInit = require("./utils/pg.init");

let expressServer = null;
//....
const start = async () => {
  const servicePort = process.env.HTTP_PORT ? process.env.HTTP_PORT : 3000;
  expressServer = app.listen(servicePort);
  console.log("Listening port " + servicePort.toString());

  await databaseInit();
  await connectToRedis();
  await startMapping();
  await startListener();
  if (process.env.GRPC_ACTIVE) {
    await startGrpc();
  }
  await startCronJobs();
};

process.on("SIGINT", async () => {
  console.log("Caught interrupt signal");
  await expressServer.close();
  if (process.env.GRPC_ACTIVE) {
    await closeGrpc();
  }
  process.exit(0);
});

start();
