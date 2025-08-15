const { HttpServerError } = require("common");

const { ReportPolicy } = require("models");
const { Op } = require("sequelize");

const updateReportPolicyByIdList = async (idList, dataClause) => {
  try {
    let rowsCount = null;
    let rows = null;

    const options = {
      where: { id: { [Op.in]: idList }, isActive: true },
      returning: true,
    };

    [rowsCount, rows] = await ReportPolicy.update(dataClause, options);
    const reportPolicyIdList = rows.map((item) => item.id);
    return reportPolicyIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenUpdatingReportPolicyByIdList",
      err,
    );
  }
};

module.exports = updateReportPolicyByIdList;
