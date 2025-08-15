const express = require("express");

// MetricDatapoint Db Object Rest Api Router
const metricDatapointRouter = express.Router();

// add MetricDatapoint controllers

// getMetricDatapoint controller
metricDatapointRouter.get(
  "/metricdatapoints/:metricDatapointId",
  require("./get-metricdatapoint"),
);
// createMetricDatapoint controller
metricDatapointRouter.post(
  "/metricdatapoints",
  require("./create-metricdatapoint"),
);
// updateMetricDatapoint controller
metricDatapointRouter.patch(
  "/metricdatapoints/:metricDatapointId",
  require("./update-metricdatapoint"),
);
// deleteMetricDatapoint controller
metricDatapointRouter.delete(
  "/metricdatapoints/:metricDatapointId",
  require("./delete-metricdatapoint"),
);
// listMetricDatapoints controller
metricDatapointRouter.get(
  "/metricdatapoints",
  require("./list-metricdatapoints"),
);

module.exports = metricDatapointRouter;
