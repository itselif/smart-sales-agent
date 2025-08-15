const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { ReportPolicy } = require("models");
const { Op } = require("sequelize");

const getIdListOfReportPolicyByField = async (
  fieldName,
  fieldValue,
  isArray,
) => {
  try {
    let isValidField = false;

    const reportPolicyProperties = [
      "id",
      "reportType",
      "maxRetentionDays",
      "allowedFormats",
      "description",
    ];

    isValidField = reportPolicyProperties.includes(fieldName);

    if (!isValidField) {
      throw new BadRequestError(`Invalid field name: ${fieldName}.`);
    }

    const expectedType = typeof ReportPolicy[fieldName];

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

    let reportPolicyIdList = await ReportPolicy.findAll(options);

    if (!reportPolicyIdList || reportPolicyIdList.length === 0) {
      throw new NotFoundError(
        `ReportPolicy with the specified criteria not found`,
      );
    }

    reportPolicyIdList = reportPolicyIdList.map((item) => item.id);
    return reportPolicyIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingReportPolicyIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfReportPolicyByField;
