const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  dbGetReportfile: require("./dbGetReportfile"),
  dbCreateReportfile: require("./dbCreateReportfile"),
  dbUpdateReportfile: require("./dbUpdateReportfile"),
  dbDeleteReportfile: require("./dbDeleteReportfile"),
  dbListReportfiles: require("./dbListReportfiles"),
  createReportFile: utils.createReportFile,
  getIdListOfReportFileByField: utils.getIdListOfReportFileByField,
  getReportFileById: utils.getReportFileById,
  getReportFileAggById: utils.getReportFileAggById,
  getReportFileListByQuery: utils.getReportFileListByQuery,
  getReportFileStatsByQuery: utils.getReportFileStatsByQuery,
  getReportFileByQuery: utils.getReportFileByQuery,
  updateReportFileById: utils.updateReportFileById,
  updateReportFileByIdList: utils.updateReportFileByIdList,
  updateReportFileByQuery: utils.updateReportFileByQuery,
  deleteReportFileById: utils.deleteReportFileById,
  deleteReportFileByQuery: utils.deleteReportFileByQuery,
};
