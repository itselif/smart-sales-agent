const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { ReportRequest, ReportFile, ReportPolicy } = require("models");
const { Op } = require("sequelize");

const getReportFileAggById = async (reportFileId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const reportFile = Array.isArray(reportFileId)
      ? await ReportFile.findAll({
          where: {
            id: { [Op.in]: reportFileId },
            isActive: true,
          },
          include: includes,
        })
      : await ReportFile.findOne({
          where: {
            id: reportFileId,
            isActive: true,
          },
          include: includes,
        });

    if (!reportFile) {
      return null;
    }

    const reportFileData =
      Array.isArray(reportFileId) && reportFileId.length > 0
        ? reportFile.map((item) => item.getData())
        : reportFile.getData();
    await ReportFile.getCqrsJoins(reportFileData);
    return reportFileData;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingReportFileAggById",
      err,
    );
  }
};

module.exports = getReportFileAggById;
