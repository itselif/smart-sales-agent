const { HttpServerError, BadRequestError } = require("common");

const { ReportRequest } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getReportRequestByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const reportRequest = await ReportRequest.findOne({
      where: { ...query, isActive: true },
    });

    if (!reportRequest) return null;
    return reportRequest.getData();
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingReportRequestByQuery",
      err,
    );
  }
};

module.exports = getReportRequestByQuery;
