const { HttpServerError } = require("common");

const { MetricDatapoint } = require("models");
const { Op } = require("sequelize");

const updateMetricDatapointByIdList = async (idList, dataClause) => {
  try {
    let rowsCount = null;
    let rows = null;

    const options = {
      where: { id: { [Op.in]: idList }, isActive: true },
      returning: true,
    };

    [rowsCount, rows] = await MetricDatapoint.update(dataClause, options);
    const metricDatapointIdList = rows.map((item) => item.id);
    return metricDatapointIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenUpdatingMetricDatapointByIdList",
      err,
    );
  }
};

module.exports = updateMetricDatapointByIdList;
