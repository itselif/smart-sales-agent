module.exports = (headers) => {
  // ReportFile Db Object Rest Api Router
  const reportFileMcpRouter = [];
  // getReportFile controller
  reportFileMcpRouter.push(require("./get-reportfile")(headers));
  // createReportFile controller
  reportFileMcpRouter.push(require("./create-reportfile")(headers));
  // updateReportFile controller
  reportFileMcpRouter.push(require("./update-reportfile")(headers));
  // deleteReportFile controller
  reportFileMcpRouter.push(require("./delete-reportfile")(headers));
  // listReportFiles controller
  reportFileMcpRouter.push(require("./list-reportfiles")(headers));
  return reportFileMcpRouter;
};
