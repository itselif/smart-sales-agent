const express = require("express");

// ReportFile Db Object Rest Api Router
const reportFileRouter = express.Router();

// add ReportFile controllers

// getReportFile controller
reportFileRouter.get("/reportfiles/:reportFileId", require("./get-reportfile"));
// createReportFile controller
reportFileRouter.post("/reportfiles", require("./create-reportfile"));
// updateReportFile controller
reportFileRouter.patch(
  "/reportfiles/:reportFileId",
  require("./update-reportfile"),
);
// deleteReportFile controller
reportFileRouter.delete(
  "/reportfiles/:reportFileId",
  require("./delete-reportfile"),
);
// listReportFiles controller
reportFileRouter.get("/reportfiles", require("./list-reportfiles"));

module.exports = reportFileRouter;
