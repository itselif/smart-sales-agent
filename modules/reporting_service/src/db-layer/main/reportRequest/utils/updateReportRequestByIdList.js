const { HttpServerError } = require("common");

const { ReportRequest } = require("models");
const { Op } = require("sequelize");

const updateReportRequestByIdList = async (idList, dataClause) => {
  try {
    let rowsCount = null;
    let rows = null;

    const options = {
      where: { id: { [Op.in]: idList }, isActive: true },
      returning: true,
    };

    [rowsCount, rows] = await ReportRequest.update(dataClause, options);
    const reportRequestIdList = rows.map((item) => item.id);
    return reportRequestIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenUpdatingReportRequestByIdList",
      err,
    );
  }
};

module.exports = updateReportRequestByIdList;
