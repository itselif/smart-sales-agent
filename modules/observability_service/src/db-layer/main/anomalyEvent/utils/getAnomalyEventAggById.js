const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { AuditLog, MetricDatapoint, AnomalyEvent } = require("models");
const { Op } = require("sequelize");

const getAnomalyEventAggById = async (anomalyEventId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const anomalyEvent = Array.isArray(anomalyEventId)
      ? await AnomalyEvent.findAll({
          where: {
            id: { [Op.in]: anomalyEventId },
            isActive: true,
          },
          include: includes,
        })
      : await AnomalyEvent.findOne({
          where: {
            id: anomalyEventId,
            isActive: true,
          },
          include: includes,
        });

    if (!anomalyEvent) {
      return null;
    }

    const anomalyEventData =
      Array.isArray(anomalyEventId) && anomalyEventId.length > 0
        ? anomalyEvent.map((item) => item.getData())
        : anomalyEvent.getData();
    await AnomalyEvent.getCqrsJoins(anomalyEventData);
    return anomalyEventData;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAnomalyEventAggById",
      err,
    );
  }
};

module.exports = getAnomalyEventAggById;
