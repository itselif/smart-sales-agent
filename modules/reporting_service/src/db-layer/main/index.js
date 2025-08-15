const reportRequestFunctions = require("./reportRequest");
const reportFileFunctions = require("./reportFile");
const reportPolicyFunctions = require("./reportPolicy");

module.exports = {
  // main Database
  // ReportRequest Db Object
  dbGetReportrequest: reportRequestFunctions.dbGetReportrequest,
  dbCreateReportrequest: reportRequestFunctions.dbCreateReportrequest,
  dbUpdateReportrequest: reportRequestFunctions.dbUpdateReportrequest,
  dbDeleteReportrequest: reportRequestFunctions.dbDeleteReportrequest,
  dbListReportrequests: reportRequestFunctions.dbListReportrequests,
  createReportRequest: reportRequestFunctions.createReportRequest,
  getIdListOfReportRequestByField:
    reportRequestFunctions.getIdListOfReportRequestByField,
  getReportRequestById: reportRequestFunctions.getReportRequestById,
  getReportRequestAggById: reportRequestFunctions.getReportRequestAggById,
  getReportRequestListByQuery:
    reportRequestFunctions.getReportRequestListByQuery,
  getReportRequestStatsByQuery:
    reportRequestFunctions.getReportRequestStatsByQuery,
  getReportRequestByQuery: reportRequestFunctions.getReportRequestByQuery,
  updateReportRequestById: reportRequestFunctions.updateReportRequestById,
  updateReportRequestByIdList:
    reportRequestFunctions.updateReportRequestByIdList,
  updateReportRequestByQuery: reportRequestFunctions.updateReportRequestByQuery,
  deleteReportRequestById: reportRequestFunctions.deleteReportRequestById,
  deleteReportRequestByQuery: reportRequestFunctions.deleteReportRequestByQuery,

  // ReportFile Db Object
  dbGetReportfile: reportFileFunctions.dbGetReportfile,
  dbCreateReportfile: reportFileFunctions.dbCreateReportfile,
  dbUpdateReportfile: reportFileFunctions.dbUpdateReportfile,
  dbDeleteReportfile: reportFileFunctions.dbDeleteReportfile,
  dbListReportfiles: reportFileFunctions.dbListReportfiles,
  createReportFile: reportFileFunctions.createReportFile,
  getIdListOfReportFileByField:
    reportFileFunctions.getIdListOfReportFileByField,
  getReportFileById: reportFileFunctions.getReportFileById,
  getReportFileAggById: reportFileFunctions.getReportFileAggById,
  getReportFileListByQuery: reportFileFunctions.getReportFileListByQuery,
  getReportFileStatsByQuery: reportFileFunctions.getReportFileStatsByQuery,
  getReportFileByQuery: reportFileFunctions.getReportFileByQuery,
  updateReportFileById: reportFileFunctions.updateReportFileById,
  updateReportFileByIdList: reportFileFunctions.updateReportFileByIdList,
  updateReportFileByQuery: reportFileFunctions.updateReportFileByQuery,
  deleteReportFileById: reportFileFunctions.deleteReportFileById,
  deleteReportFileByQuery: reportFileFunctions.deleteReportFileByQuery,

  // ReportPolicy Db Object
  dbGetReportpolicy: reportPolicyFunctions.dbGetReportpolicy,
  dbCreateReportpolicy: reportPolicyFunctions.dbCreateReportpolicy,
  dbUpdateReportpolicy: reportPolicyFunctions.dbUpdateReportpolicy,
  dbDeleteReportpolicy: reportPolicyFunctions.dbDeleteReportpolicy,
  dbListReportpolicies: reportPolicyFunctions.dbListReportpolicies,
  createReportPolicy: reportPolicyFunctions.createReportPolicy,
  getIdListOfReportPolicyByField:
    reportPolicyFunctions.getIdListOfReportPolicyByField,
  getReportPolicyById: reportPolicyFunctions.getReportPolicyById,
  getReportPolicyAggById: reportPolicyFunctions.getReportPolicyAggById,
  getReportPolicyListByQuery: reportPolicyFunctions.getReportPolicyListByQuery,
  getReportPolicyStatsByQuery:
    reportPolicyFunctions.getReportPolicyStatsByQuery,
  getReportPolicyByQuery: reportPolicyFunctions.getReportPolicyByQuery,
  updateReportPolicyById: reportPolicyFunctions.updateReportPolicyById,
  updateReportPolicyByIdList: reportPolicyFunctions.updateReportPolicyByIdList,
  updateReportPolicyByQuery: reportPolicyFunctions.updateReportPolicyByQuery,
  deleteReportPolicyById: reportPolicyFunctions.deleteReportPolicyById,
  deleteReportPolicyByQuery: reportPolicyFunctions.deleteReportPolicyByQuery,
};
