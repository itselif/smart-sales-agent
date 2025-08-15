const { HttpServerError, BadRequestError } = require("common");

const { AnomalyEvent } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getAnomalyEventListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const anomalyEvent = await AnomalyEvent.findAll({
      where: { ...query, isActive: true },
    });

    //should i add not found error or only return empty array?
    if (!anomalyEvent || anomalyEvent.length === 0) return [];

    //      if (!anomalyEvent || anomalyEvent.length === 0) {
    //      throw new NotFoundError(
    //      `AnomalyEvent with the specified criteria not found`
    //  );
    //}

    return anomalyEvent.map((item) => item.getData());
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAnomalyEventListByQuery",
      err,
    );
  }
};

module.exports = getAnomalyEventListByQuery;
