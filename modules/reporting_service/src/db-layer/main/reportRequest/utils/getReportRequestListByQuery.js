const { HttpServerError, BadRequestError } = require("common");

const { ReportRequest } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getReportRequestListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const reportRequest = await ReportRequest.findAll({
      where: { ...query, isActive: true },
    });

    //should i add not found error or only return empty array?
    if (!reportRequest || reportRequest.length === 0) return [];

    //      if (!reportRequest || reportRequest.length === 0) {
    //      throw new NotFoundError(
    //      `ReportRequest with the specified criteria not found`
    //  );
    //}

    return reportRequest.map((item) => item.getData());
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingReportRequestListByQuery",
      err,
    );
  }
};

module.exports = getReportRequestListByQuery;
