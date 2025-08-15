const { HttpServerError, BadRequestError } = require("common");

const { ReportFile } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getReportFileByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const reportFile = await ReportFile.findOne({
      where: { ...query, isActive: true },
    });

    if (!reportFile) return null;
    return reportFile.getData();
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingReportFileByQuery",
      err,
    );
  }
};

module.exports = getReportFileByQuery;
