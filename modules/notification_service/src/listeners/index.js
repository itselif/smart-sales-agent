const startBaseListeners = require("./base");
const accountRegistrationConfirmationListeners = require("./accountRegistrationConfirmation.listener");
const reportReadyForDownloadListeners = require("./reportReadyForDownload.listener");
const lowStockAlertListeners = require("./lowStockAlert.listener");
const transactionCorrectionAuditListeners = require("./transactionCorrectionAudit.listener");
const systemHealthIncidentListeners = require("./systemHealthIncident.listener");
const storeOverrideGrantedListeners = require("./storeOverrideGranted.listener");
const adminCICDStatusListeners = require("./adminCICDStatus.listener");
const userVerificationListeners = require("./userVerification.listener");
const userResetPasswordListeners = require("./userResetPassword.listener");

const startListener = async () => {
  try {
    await startBaseListeners();
    await accountRegistrationConfirmationListeners();
    await reportReadyForDownloadListeners();
    await lowStockAlertListeners();
    await transactionCorrectionAuditListeners();
    await systemHealthIncidentListeners();
    await storeOverrideGrantedListeners();
    await adminCICDStatusListeners();
    await userVerificationListeners();
    await userResetPasswordListeners();
  } catch (error) {}
};

module.exports = startListener;
