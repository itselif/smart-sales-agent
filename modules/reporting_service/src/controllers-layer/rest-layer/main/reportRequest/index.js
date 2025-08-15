const express = require("express");

// ReportRequest Db Object Rest Api Router
const reportRequestRouter = express.Router();

// add ReportRequest controllers

// getReportRequest controller
reportRequestRouter.get(
  "/reportrequests/:reportRequestId",
  require("./get-reportrequest"),
);
// createReportRequest controller
reportRequestRouter.post("/reportrequests", require("./create-reportrequest"));
// updateReportRequest controller
reportRequestRouter.patch(
  "/reportrequests/:reportRequestId",
  require("./update-reportrequest"),
);
// deleteReportRequest controller
reportRequestRouter.delete(
  "/reportrequests/:reportRequestId",
  require("./delete-reportrequest"),
);
// listReportRequests controller
reportRequestRouter.get("/reportrequests", require("./list-reportrequests"));

module.exports = reportRequestRouter;
