const { HttpServerError, BadRequestError } = require("common");

const { AnomalyEvent } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getAnomalyEventByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const anomalyEvent = await AnomalyEvent.findOne({
      where: { ...query, isActive: true },
    });

    if (!anomalyEvent) return null;
    return anomalyEvent.getData();
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAnomalyEventByQuery",
      err,
    );
  }
};

module.exports = getAnomalyEventByQuery;
