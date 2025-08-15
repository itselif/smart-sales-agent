const { HttpServerError, BadRequestError } = require("common");

const { ReportPolicy } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getReportPolicyListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const reportPolicy = await ReportPolicy.findAll({
      where: { ...query, isActive: true },
    });

    //should i add not found error or only return empty array?
    if (!reportPolicy || reportPolicy.length === 0) return [];

    //      if (!reportPolicy || reportPolicy.length === 0) {
    //      throw new NotFoundError(
    //      `ReportPolicy with the specified criteria not found`
    //  );
    //}

    return reportPolicy.map((item) => item.getData());
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingReportPolicyListByQuery",
      err,
    );
  }
};

module.exports = getReportPolicyListByQuery;
