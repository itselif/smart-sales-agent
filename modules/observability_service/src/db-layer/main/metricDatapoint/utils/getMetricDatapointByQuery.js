const { HttpServerError, BadRequestError } = require("common");

const { MetricDatapoint } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getMetricDatapointByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const metricDatapoint = await MetricDatapoint.findOne({
      where: { ...query, isActive: true },
    });

    if (!metricDatapoint) return null;
    return metricDatapoint.getData();
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingMetricDatapointByQuery",
      err,
    );
  }
};

module.exports = getMetricDatapointByQuery;
