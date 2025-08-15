const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  dbGetReportrequest: require("./dbGetReportrequest"),
  dbCreateReportrequest: require("./dbCreateReportrequest"),
  dbUpdateReportrequest: require("./dbUpdateReportrequest"),
  dbDeleteReportrequest: require("./dbDeleteReportrequest"),
  dbListReportrequests: require("./dbListReportrequests"),
  createReportRequest: utils.createReportRequest,
  getIdListOfReportRequestByField: utils.getIdListOfReportRequestByField,
  getReportRequestById: utils.getReportRequestById,
  getReportRequestAggById: utils.getReportRequestAggById,
  getReportRequestListByQuery: utils.getReportRequestListByQuery,
  getReportRequestStatsByQuery: utils.getReportRequestStatsByQuery,
  getReportRequestByQuery: utils.getReportRequestByQuery,
  updateReportRequestById: utils.updateReportRequestById,
  updateReportRequestByIdList: utils.updateReportRequestByIdList,
  updateReportRequestByQuery: utils.updateReportRequestByQuery,
  deleteReportRequestById: utils.deleteReportRequestById,
  deleteReportRequestByQuery: utils.deleteReportRequestByQuery,
};
