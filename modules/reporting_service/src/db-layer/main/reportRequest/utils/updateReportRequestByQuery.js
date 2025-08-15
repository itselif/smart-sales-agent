const { HttpServerError, BadRequestError } = require("common");

const { ReportRequest } = require("models");
const { Op } = require("sequelize");

const updateReportRequestByQuery = async (dataClause, query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }
    let rowsCount = null;
    let rows = null;

    const options = { where: { query, isActive: true }, returning: true };

    [rowsCount, rows] = await ReportRequest.update(dataClause, options);

    if (!rowsCount) return [];
    return rows.map((item) => item.getData());
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenUpdatingReportRequestByQuery",
      err,
    );
  }
};

module.exports = updateReportRequestByQuery;
