const { HttpServerError } = require("common");

let { AnomalyEvent } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getAnomalyEventById = async (anomalyEventId) => {
  try {
    const anomalyEvent = Array.isArray(anomalyEventId)
      ? await AnomalyEvent.findAll({
          where: {
            id: { [Op.in]: anomalyEventId },
            isActive: true,
          },
        })
      : await AnomalyEvent.findOne({
          where: {
            id: anomalyEventId,
            isActive: true,
          },
        });

    if (!anomalyEvent) {
      return null;
    }
    return Array.isArray(anomalyEventId)
      ? anomalyEvent.map((item) => item.getData())
      : anomalyEvent.getData();
  } catch (err) {
    console.log(err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAnomalyEventById",
      err,
    );
  }
};

module.exports = getAnomalyEventById;
