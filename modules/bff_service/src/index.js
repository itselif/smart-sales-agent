const env = process.env.NODE_ENV ?? "prod";
require("dotenv").config({ path: `.${env}.env` });

const app = require("./express-app");
const startListener = require("listeners");
const { startRepairJobs } = require("crons");
const { repairService } = require("services");
let expressServer = null;

const start = async () => {
  const servicePort = process.env.HTTP_PORT ? process.env.HTTP_PORT : 3000;
  expressServer = app.listen(servicePort);
  console.log("Listening port " + servicePort.toString());

  await startListener();
  await startRepairJobs();
  await repairService.runAllRepair();
};

process.on("SIGINT", async () => {
  console.log("Caught interrupt signal");
  await expressServer.close();
  process.exit(0);
});

start();
