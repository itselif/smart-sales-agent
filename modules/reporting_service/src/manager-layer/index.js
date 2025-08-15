module.exports = {
  ReportingServiceManager: require("./service-manager/ReportingServiceManager"),
  // main Database Crud Object Routes Manager Layer Classes
  // ReportRequest Db Object
  GetReportRequestManager: require("./main/reportRequest/get-reportrequest"),
  CreateReportRequestManager: require("./main/reportRequest/create-reportrequest"),
  UpdateReportRequestManager: require("./main/reportRequest/update-reportrequest"),
  DeleteReportRequestManager: require("./main/reportRequest/delete-reportrequest"),
  ListReportRequestsManager: require("./main/reportRequest/list-reportrequests"),
  // ReportFile Db Object
  GetReportFileManager: require("./main/reportFile/get-reportfile"),
  CreateReportFileManager: require("./main/reportFile/create-reportfile"),
  UpdateReportFileManager: require("./main/reportFile/update-reportfile"),
  DeleteReportFileManager: require("./main/reportFile/delete-reportfile"),
  ListReportFilesManager: require("./main/reportFile/list-reportfiles"),
  // ReportPolicy Db Object
  GetReportPolicyManager: require("./main/reportPolicy/get-reportpolicy"),
  CreateReportPolicyManager: require("./main/reportPolicy/create-reportpolicy"),
  UpdateReportPolicyManager: require("./main/reportPolicy/update-reportpolicy"),
  DeleteReportPolicyManager: require("./main/reportPolicy/delete-reportpolicy"),
  ListReportPoliciesManager: require("./main/reportPolicy/list-reportpolicies"),
};
