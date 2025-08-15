const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  dbGetReportpolicy: require("./dbGetReportpolicy"),
  dbCreateReportpolicy: require("./dbCreateReportpolicy"),
  dbUpdateReportpolicy: require("./dbUpdateReportpolicy"),
  dbDeleteReportpolicy: require("./dbDeleteReportpolicy"),
  dbListReportpolicies: require("./dbListReportpolicies"),
  createReportPolicy: utils.createReportPolicy,
  getIdListOfReportPolicyByField: utils.getIdListOfReportPolicyByField,
  getReportPolicyById: utils.getReportPolicyById,
  getReportPolicyAggById: utils.getReportPolicyAggById,
  getReportPolicyListByQuery: utils.getReportPolicyListByQuery,
  getReportPolicyStatsByQuery: utils.getReportPolicyStatsByQuery,
  getReportPolicyByQuery: utils.getReportPolicyByQuery,
  updateReportPolicyById: utils.updateReportPolicyById,
  updateReportPolicyByIdList: utils.updateReportPolicyByIdList,
  updateReportPolicyByQuery: utils.updateReportPolicyByQuery,
  deleteReportPolicyById: utils.deleteReportPolicyById,
  deleteReportPolicyByQuery: utils.deleteReportPolicyByQuery,
};
