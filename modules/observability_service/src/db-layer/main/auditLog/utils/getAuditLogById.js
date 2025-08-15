const { HttpServerError } = require("common");

let { AuditLog } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getAuditLogById = async (auditLogId) => {
  try {
    const auditLog = Array.isArray(auditLogId)
      ? await AuditLog.findAll({
          where: {
            id: { [Op.in]: auditLogId },
            isActive: true,
          },
        })
      : await AuditLog.findOne({
          where: {
            id: auditLogId,
            isActive: true,
          },
        });

    if (!auditLog) {
      return null;
    }
    return Array.isArray(auditLogId)
      ? auditLog.map((item) => item.getData())
      : auditLog.getData();
  } catch (err) {
    console.log(err);
    throw new HttpServerError("errMsg_dbErrorWhenRequestingAuditLogById", err);
  }
};

module.exports = getAuditLogById;
