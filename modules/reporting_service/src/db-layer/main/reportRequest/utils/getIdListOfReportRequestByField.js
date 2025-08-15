const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { ReportRequest } = require("models");
const { Op } = require("sequelize");

const getIdListOfReportRequestByField = async (
  fieldName,
  fieldValue,
  isArray,
) => {
  try {
    let isValidField = false;

    const reportRequestProperties = [
      "id",
      "requestedByUserId",
      "reportType",
      "storeIds",
      "dateFrom",
      "dateTo",
      "productIds",
      "format",
      "status",
    ];

    isValidField = reportRequestProperties.includes(fieldName);

    if (!isValidField) {
      throw new BadRequestError(`Invalid field name: ${fieldName}.`);
    }

    const expectedType = typeof ReportRequest[fieldName];

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

    let reportRequestIdList = await ReportRequest.findAll(options);

    if (!reportRequestIdList || reportRequestIdList.length === 0) {
      throw new NotFoundError(
        `ReportRequest with the specified criteria not found`,
      );
    }

    reportRequestIdList = reportRequestIdList.map((item) => item.id);
    return reportRequestIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingReportRequestIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfReportRequestByField;
