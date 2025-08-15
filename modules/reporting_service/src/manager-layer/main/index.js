module.exports = {
  // main Database Crud Object Routes Manager Layer Classes
  // ReportRequest Db Object
  GetReportRequestManager: require("./reportRequest/get-reportrequest"),
  CreateReportRequestManager: require("./reportRequest/create-reportrequest"),
  UpdateReportRequestManager: require("./reportRequest/update-reportrequest"),
  DeleteReportRequestManager: require("./reportRequest/delete-reportrequest"),
  ListReportRequestsManager: require("./reportRequest/list-reportrequests"),
  // ReportFile Db Object
  GetReportFileManager: require("./reportFile/get-reportfile"),
  CreateReportFileManager: require("./reportFile/create-reportfile"),
  UpdateReportFileManager: require("./reportFile/update-reportfile"),
  DeleteReportFileManager: require("./reportFile/delete-reportfile"),
  ListReportFilesManager: require("./reportFile/list-reportfiles"),
  // ReportPolicy Db Object
  GetReportPolicyManager: require("./reportPolicy/get-reportpolicy"),
  CreateReportPolicyManager: require("./reportPolicy/create-reportpolicy"),
  UpdateReportPolicyManager: require("./reportPolicy/update-reportpolicy"),
  DeleteReportPolicyManager: require("./reportPolicy/delete-reportpolicy"),
  ListReportPoliciesManager: require("./reportPolicy/list-reportpolicies"),
};
