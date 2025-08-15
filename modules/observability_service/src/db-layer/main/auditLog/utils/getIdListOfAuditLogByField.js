const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { AuditLog } = require("models");
const { Op } = require("sequelize");

const getIdListOfAuditLogByField = async (fieldName, fieldValue, isArray) => {
  try {
    let isValidField = false;

    const auditLogProperties = [
      "id",
      "userId",
      "actionType",
      "entityType",
      "entityId",
      "beforeData",
      "afterData",
      "severity",
      "message",
      "traceContext",
      "storeId",
    ];

    isValidField = auditLogProperties.includes(fieldName);

    if (!isValidField) {
      throw new BadRequestError(`Invalid field name: ${fieldName}.`);
    }

    const expectedType = typeof AuditLog[fieldName];

    if (typeof fieldValue !== expectedType) {
      throw new BadRequestError(
        `Invalid field value type for ${fieldName}. Expected ${expectedType}.`,
      );
    }

    const options = {
      where: isArray
        ? { [fieldName]: { [Op.contains]: [fieldValue] }, isActive: true }
        : { [fieldName]: fieldValue, isActive: true },
      attributes: ["id"],
    };

    let auditLogIdList = await AuditLog.findAll(options);

    if (!auditLogIdList || auditLogIdList.length === 0) {
      throw new NotFoundError(`AuditLog with the specified criteria not found`);
    }

    auditLogIdList = auditLogIdList.map((item) => item.id);
    return auditLogIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAuditLogIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfAuditLogByField;
