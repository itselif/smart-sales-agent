const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  dbGetMetricdatapoint: require("./dbGetMetricdatapoint"),
  dbCreateMetricdatapoint: require("./dbCreateMetricdatapoint"),
  dbUpdateMetricdatapoint: require("./dbUpdateMetricdatapoint"),
  dbDeleteMetricdatapoint: require("./dbDeleteMetricdatapoint"),
  dbListMetricdatapoints: require("./dbListMetricdatapoints"),
  createMetricDatapoint: utils.createMetricDatapoint,
  getIdListOfMetricDatapointByField: utils.getIdListOfMetricDatapointByField,
  getMetricDatapointById: utils.getMetricDatapointById,
  getMetricDatapointAggById: utils.getMetricDatapointAggById,
  getMetricDatapointListByQuery: utils.getMetricDatapointListByQuery,
  getMetricDatapointStatsByQuery: utils.getMetricDatapointStatsByQuery,
  getMetricDatapointByQuery: utils.getMetricDatapointByQuery,
  updateMetricDatapointById: utils.updateMetricDatapointById,
  updateMetricDatapointByIdList: utils.updateMetricDatapointByIdList,
  updateMetricDatapointByQuery: utils.updateMetricDatapointByQuery,
  deleteMetricDatapointById: utils.deleteMetricDatapointById,
  deleteMetricDatapointByQuery: utils.deleteMetricDatapointByQuery,
};
