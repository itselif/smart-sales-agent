const { HttpServerError } = require("common");

const { ReportFile } = require("models");
const { Op } = require("sequelize");

const updateReportFileByIdList = async (idList, dataClause) => {
  try {
    let rowsCount = null;
    let rows = null;

    const options = {
      where: { id: { [Op.in]: idList }, isActive: true },
      returning: true,
    };

    [rowsCount, rows] = await ReportFile.update(dataClause, options);
    const reportFileIdList = rows.map((item) => item.id);
    return reportFileIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenUpdatingReportFileByIdList",
      err,
    );
  }
};

module.exports = updateReportFileByIdList;
