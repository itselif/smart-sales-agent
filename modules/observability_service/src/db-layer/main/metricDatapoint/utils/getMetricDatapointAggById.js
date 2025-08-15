const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { AuditLog, MetricDatapoint, AnomalyEvent } = require("models");
const { Op } = require("sequelize");

const getMetricDatapointAggById = async (metricDatapointId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const metricDatapoint = Array.isArray(metricDatapointId)
      ? await MetricDatapoint.findAll({
          where: {
            id: { [Op.in]: metricDatapointId },
            isActive: true,
          },
          include: includes,
        })
      : await MetricDatapoint.findOne({
          where: {
            id: metricDatapointId,
            isActive: true,
          },
          include: includes,
        });

    if (!metricDatapoint) {
      return null;
    }

    const metricDatapointData =
      Array.isArray(metricDatapointId) && metricDatapointId.length > 0
        ? metricDatapoint.map((item) => item.getData())
        : metricDatapoint.getData();
    await MetricDatapoint.getCqrsJoins(metricDatapointData);
    return metricDatapointData;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingMetricDatapointAggById",
      err,
    );
  }
};

module.exports = getMetricDatapointAggById;
