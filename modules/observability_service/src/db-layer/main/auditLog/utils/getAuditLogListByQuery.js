const { HttpServerError, BadRequestError } = require("common");

const { AuditLog } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getAuditLogListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const auditLog = await AuditLog.findAll({
      where: { ...query, isActive: true },
    });

    //should i add not found error or only return empty array?
    if (!auditLog || auditLog.length === 0) return [];

    //      if (!auditLog || auditLog.length === 0) {
    //      throw new NotFoundError(
    //      `AuditLog with the specified criteria not found`
    //  );
    //}

    return auditLog.map((item) => item.getData());
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAuditLogListByQuery",
      err,
    );
  }
};

module.exports = getAuditLogListByQuery;
