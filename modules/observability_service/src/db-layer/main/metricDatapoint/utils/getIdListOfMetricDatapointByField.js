const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { MetricDatapoint } = require("models");
const { Op } = require("sequelize");

const getIdListOfMetricDatapointByField = async (
  fieldName,
  fieldValue,
  isArray,
) => {
  try {
    let isValidField = false;

    const metricDatapointProperties = [
      "id",
      "metricType",
      "targetType",
      "targetId",
      "periodStart",
      "granularity",
      "value",
      "flagAnomalous",
      "observedByUserId",
      "context",
    ];

    isValidField = metricDatapointProperties.includes(fieldName);

    if (!isValidField) {
      throw new BadRequestError(`Invalid field name: ${fieldName}.`);
    }

    const expectedType = typeof MetricDatapoint[fieldName];

    if (typeof fieldValue !== expectedType) {
      throw new BadRequestError(
        `Invalid field value type for ${fieldName}. Expected ${expectedType}.`,
      );
    }

    const options = {
      where: isArray
        ? { [fieldName]: { [Op.contains]: [fieldValue] }, isActive: true }
        : { [fieldName]: fieldValue, isActive: true },
      attributes: ["id"],
    };

    let metricDatapointIdList = await MetricDatapoint.findAll(options);

    if (!metricDatapointIdList || metricDatapointIdList.length === 0) {
      throw new NotFoundError(
        `MetricDatapoint with the specified criteria not found`,
      );
    }

    metricDatapointIdList = metricDatapointIdList.map((item) => item.id);
    return metricDatapointIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingMetricDatapointIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfMetricDatapointByField;
