module.exports = (headers) => {
  // ReportRequest Db Object Rest Api Router
  const reportRequestMcpRouter = [];
  // getReportRequest controller
  reportRequestMcpRouter.push(require("./get-reportrequest")(headers));
  // createReportRequest controller
  reportRequestMcpRouter.push(require("./create-reportrequest")(headers));
  // updateReportRequest controller
  reportRequestMcpRouter.push(require("./update-reportrequest")(headers));
  // deleteReportRequest controller
  reportRequestMcpRouter.push(require("./delete-reportrequest")(headers));
  // listReportRequests controller
  reportRequestMcpRouter.push(require("./list-reportrequests")(headers));
  return reportRequestMcpRouter;
};
