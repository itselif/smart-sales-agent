const { HttpServerError } = require("common");

const { AnomalyEvent } = require("models");
const { Op } = require("sequelize");

const updateAnomalyEventByIdList = async (idList, dataClause) => {
  try {
    let rowsCount = null;
    let rows = null;

    const options = {
      where: { id: { [Op.in]: idList }, isActive: true },
      returning: true,
    };

    [rowsCount, rows] = await AnomalyEvent.update(dataClause, options);
    const anomalyEventIdList = rows.map((item) => item.id);
    return anomalyEventIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenUpdatingAnomalyEventByIdList",
      err,
    );
  }
};

module.exports = updateAnomalyEventByIdList;
