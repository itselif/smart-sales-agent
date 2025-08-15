const { HttpServerError } = require("common");

const { AuditLog } = require("models");
const { Op } = require("sequelize");

const updateAuditLogByIdList = async (idList, dataClause) => {
  try {
    let rowsCount = null;
    let rows = null;

    const options = {
      where: { id: { [Op.in]: idList }, isActive: true },
      returning: true,
    };

    [rowsCount, rows] = await AuditLog.update(dataClause, options);
    const auditLogIdList = rows.map((item) => item.id);
    return auditLogIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenUpdatingAuditLogByIdList",
      err,
    );
  }
};

module.exports = updateAuditLogByIdList;
