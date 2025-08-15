const express = require("express");

// ReportPolicy Db Object Rest Api Router
const reportPolicyRouter = express.Router();

// add ReportPolicy controllers

// getReportPolicy controller
reportPolicyRouter.get(
  "/reportpolicies/:reportPolicyId",
  require("./get-reportpolicy"),
);
// createReportPolicy controller
reportPolicyRouter.post("/reportpolicies", require("./create-reportpolicy"));
// updateReportPolicy controller
reportPolicyRouter.patch(
  "/reportpolicies/:reportPolicyId",
  require("./update-reportpolicy"),
);
// deleteReportPolicy controller
reportPolicyRouter.delete(
  "/reportpolicies/:reportPolicyId",
  require("./delete-reportpolicy"),
);
// listReportPolicies controller
reportPolicyRouter.get("/reportpolicies", require("./list-reportpolicies"));

module.exports = reportPolicyRouter;
