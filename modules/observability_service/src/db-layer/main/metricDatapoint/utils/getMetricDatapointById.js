const { HttpServerError } = require("common");

let { MetricDatapoint } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getMetricDatapointById = async (metricDatapointId) => {
  try {
    const metricDatapoint = Array.isArray(metricDatapointId)
      ? await MetricDatapoint.findAll({
          where: {
            id: { [Op.in]: metricDatapointId },
            isActive: true,
          },
        })
      : await MetricDatapoint.findOne({
          where: {
            id: metricDatapointId,
            isActive: true,
          },
        });

    if (!metricDatapoint) {
      return null;
    }
    return Array.isArray(metricDatapointId)
      ? metricDatapoint.map((item) => item.getData())
      : metricDatapoint.getData();
  } catch (err) {
    console.log(err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingMetricDatapointById",
      err,
    );
  }
};

module.exports = getMetricDatapointById;
