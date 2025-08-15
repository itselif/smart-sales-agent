const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { AuditLog, MetricDatapoint, AnomalyEvent } = require("models");
const { Op } = require("sequelize");

const getAuditLogAggById = async (auditLogId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const auditLog = Array.isArray(auditLogId)
      ? await AuditLog.findAll({
          where: {
            id: { [Op.in]: auditLogId },
            isActive: true,
          },
          include: includes,
        })
      : await AuditLog.findOne({
          where: {
            id: auditLogId,
            isActive: true,
          },
          include: includes,
        });

    if (!auditLog) {
      return null;
    }

    const auditLogData =
      Array.isArray(auditLogId) && auditLogId.length > 0
        ? auditLog.map((item) => item.getData())
        : auditLog.getData();
    await AuditLog.getCqrsJoins(auditLogData);
    return auditLogData;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAuditLogAggById",
      err,
    );
  }
};

module.exports = getAuditLogAggById;
