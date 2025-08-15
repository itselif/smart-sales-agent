const { HttpServerError, BadRequestError } = require("common");

const { ElasticIndexer } = require("serviceCommon");

const { MetricDatapoint } = require("models");
const { hexaLogger, newUUID } = require("common");

const indexDataToElastic = async (data) => {
  const elasticIndexer = new ElasticIndexer(
    "metricDatapoint",
    this.session,
    this.requestId,
  );
  await elasticIndexer.indexData(data);
};

const validateData = (data) => {
  const requiredFields = [
    "metricType",
    "targetType",
    "periodStart",
    "granularity",
    "value",
  ];

  requiredFields.forEach((field) => {
    if (data[field] === null || data[field] === undefined) {
      throw new BadRequestError(
        `Field "${field}" is required and cannot be null or undefined.`,
      );
    }
  });

  if (!data.id) {
    data.id = newUUID();
  }
};

const createMetricDatapoint = async (data) => {
  try {
    validateData(data);

    const newmetricDatapoint = await MetricDatapoint.create(data);
    const _data = newmetricDatapoint.getData();
    await indexDataToElastic(_data);
    return _data;
  } catch (err) {
    throw new HttpServerError("errMsg_dbErrorWhenCreatingMetricDatapoint", err);
  }
};

module.exports = createMetricDatapoint;
