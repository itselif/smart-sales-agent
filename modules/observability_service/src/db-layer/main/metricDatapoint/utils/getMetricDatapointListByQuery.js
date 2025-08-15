const { HttpServerError, BadRequestError } = require("common");

const { MetricDatapoint } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getMetricDatapointListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const metricDatapoint = await MetricDatapoint.findAll({
      where: { ...query, isActive: true },
    });

    //should i add not found error or only return empty array?
    if (!metricDatapoint || metricDatapoint.length === 0) return [];

    //      if (!metricDatapoint || metricDatapoint.length === 0) {
    //      throw new NotFoundError(
    //      `MetricDatapoint with the specified criteria not found`
    //  );
    //}

    return metricDatapoint.map((item) => item.getData());
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingMetricDatapointListByQuery",
      err,
    );
  }
};

module.exports = getMetricDatapointListByQuery;
