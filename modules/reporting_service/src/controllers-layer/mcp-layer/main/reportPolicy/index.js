module.exports = (headers) => {
  // ReportPolicy Db Object Rest Api Router
  const reportPolicyMcpRouter = [];
  // getReportPolicy controller
  reportPolicyMcpRouter.push(require("./get-reportpolicy")(headers));
  // createReportPolicy controller
  reportPolicyMcpRouter.push(require("./create-reportpolicy")(headers));
  // updateReportPolicy controller
  reportPolicyMcpRouter.push(require("./update-reportpolicy")(headers));
  // deleteReportPolicy controller
  reportPolicyMcpRouter.push(require("./delete-reportpolicy")(headers));
  // listReportPolicies controller
  reportPolicyMcpRouter.push(require("./list-reportpolicies")(headers));
  return reportPolicyMcpRouter;
};
