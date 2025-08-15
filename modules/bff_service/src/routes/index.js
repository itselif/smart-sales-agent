const express = require("express");
const router = express.Router();

const userRegistrationConfirmationViewRoute = require("./userRegistrationConfirmationView.route.js");
router.use(
  "/userRegistrationConfirmationView",
  userRegistrationConfirmationViewRoute,
);

const reportReadyForDownloadViewRoute = require("./reportReadyForDownloadView.route.js");
router.use("/reportReadyForDownloadView", reportReadyForDownloadViewRoute);

const lowStockAlertViewRoute = require("./lowStockAlertView.route.js");
router.use("/lowStockAlertView", lowStockAlertViewRoute);

const saleTransactionCorrectionAuditViewRoute = require("./saleTransactionCorrectionAuditView.route.js");
router.use(
  "/saleTransactionCorrectionAuditView",
  saleTransactionCorrectionAuditViewRoute,
);

const systemHealthIncidentViewRoute = require("./systemHealthIncidentView.route.js");
router.use("/systemHealthIncidentView", systemHealthIncidentViewRoute);

const storeOverrideGrantedViewRoute = require("./storeOverrideGrantedView.route.js");
router.use("/storeOverrideGrantedView", storeOverrideGrantedViewRoute);

const salesDashboardViewRoute = require("./salesDashboardView.route.js");
router.use("/salesDashboardView", salesDashboardViewRoute);

const inventoryDashboardViewRoute = require("./inventoryDashboardView.route.js");
router.use("/inventoryDashboardView", inventoryDashboardViewRoute);

const auditLogViewRoute = require("./auditLogView.route.js");
router.use("/auditLogView", auditLogViewRoute);

const crossStoreComparisonViewRoute = require("./crossStoreComparisonView.route.js");
router.use("/crossStoreComparisonView", crossStoreComparisonViewRoute);

const ciCdJobStatusNotificationViewRoute = require("./ciCdJobStatusNotificationView.route.js");
router.use(
  "/ciCdJobStatusNotificationView",
  ciCdJobStatusNotificationViewRoute,
);

const accountRegistrationConfirmationViewRoute = require("./accountRegistrationConfirmationView.route.js");
router.use(
  "/accountRegistrationConfirmationView",
  accountRegistrationConfirmationViewRoute,
);

const dynamicRoute = require("./dynamic.route.js");
router.use("/", dynamicRoute);

module.exports = router;
