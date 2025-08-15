const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { AnomalyEvent } = require("models");
const { Op } = require("sequelize");

const getIdListOfAnomalyEventByField = async (
  fieldName,
  fieldValue,
  isArray,
) => {
  try {
    let isValidField = false;

    const anomalyEventProperties = [
      "id",
      "anomalyType",
      "triggeredByUserId",
      "affectedUserId",
      "storeId",
      "relatedEntityType",
      "relatedEntityId",
      "description",
      "detectedAt",
      "severity",
      "status",
      "reviewedByUserId",
    ];

    isValidField = anomalyEventProperties.includes(fieldName);

    if (!isValidField) {
      throw new BadRequestError(`Invalid field name: ${fieldName}.`);
    }

    const expectedType = typeof AnomalyEvent[fieldName];

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

    let anomalyEventIdList = await AnomalyEvent.findAll(options);

    if (!anomalyEventIdList || anomalyEventIdList.length === 0) {
      throw new NotFoundError(
        `AnomalyEvent with the specified criteria not found`,
      );
    }

    anomalyEventIdList = anomalyEventIdList.map((item) => item.id);
    return anomalyEventIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingAnomalyEventIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfAnomalyEventByField;
