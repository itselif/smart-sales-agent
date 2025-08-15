const { HttpServerError } = require("common");

let { ReportFile } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getReportFileById = async (reportFileId) => {
  try {
    const reportFile = Array.isArray(reportFileId)
      ? await ReportFile.findAll({
          where: {
            id: { [Op.in]: reportFileId },
            isActive: true,
          },
        })
      : await ReportFile.findOne({
          where: {
            id: reportFileId,
            isActive: true,
          },
        });

    if (!reportFile) {
      return null;
    }
    return Array.isArray(reportFileId)
      ? reportFile.map((item) => item.getData())
      : reportFile.getData();
  } catch (err) {
    console.log(err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingReportFileById",
      err,
    );
  }
};

module.exports = getReportFileById;
