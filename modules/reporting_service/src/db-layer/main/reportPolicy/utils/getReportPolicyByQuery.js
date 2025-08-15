const { HttpServerError, BadRequestError } = require("common");

const { ReportPolicy } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getReportPolicyByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const reportPolicy = await ReportPolicy.findOne({
      where: { ...query, isActive: true },
    });

    if (!reportPolicy) return null;
    return reportPolicy.getData();
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingReportPolicyByQuery",
      err,
    );
  }
};

module.exports = getReportPolicyByQuery;
