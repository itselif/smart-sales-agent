const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { hexaLogger } = require("common");
const { AuditLog } = require("models");
const { Op } = require("sequelize");

const getAuditLogByStoreId = async (storeId) => {
  try {
    const auditLog = await AuditLog.findOne({
      where: {
        storeId: storeId,
        isActive: true,
      },
    });

    if (!auditLog) {
      return null;
    }
    return auditLog.getData();
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAuditLogByStoreId",
      err,
    );
  }
};

module.exports = getAuditLogByStoreId;
