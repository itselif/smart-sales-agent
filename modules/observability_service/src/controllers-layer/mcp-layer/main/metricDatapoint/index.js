module.exports = (headers) => {
  // MetricDatapoint Db Object Rest Api Router
  const metricDatapointMcpRouter = [];
  // getMetricDatapoint controller
  metricDatapointMcpRouter.push(require("./get-metricdatapoint")(headers));
  // createMetricDatapoint controller
  metricDatapointMcpRouter.push(require("./create-metricdatapoint")(headers));
  // updateMetricDatapoint controller
  metricDatapointMcpRouter.push(require("./update-metricdatapoint")(headers));
  // deleteMetricDatapoint controller
  metricDatapointMcpRouter.push(require("./delete-metricdatapoint")(headers));
  // listMetricDatapoints controller
  metricDatapointMcpRouter.push(require("./list-metricdatapoints")(headers));
  return metricDatapointMcpRouter;
};
