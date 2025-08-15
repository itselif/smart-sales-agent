const { HttpServerError, BadRequestError } = require("common");

const { ReportFile } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getReportFileListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const reportFile = await ReportFile.findAll({
      where: { ...query, isActive: true },
    });

    //should i add not found error or only return empty array?
    if (!reportFile || reportFile.length === 0) return [];

    //      if (!reportFile || reportFile.length === 0) {
    //      throw new NotFoundError(
    //      `ReportFile with the specified criteria not found`
    //  );
    //}

    return reportFile.map((item) => item.getData());
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingReportFileListByQuery",
      err,
    );
  }
};

module.exports = getReportFileListByQuery;
