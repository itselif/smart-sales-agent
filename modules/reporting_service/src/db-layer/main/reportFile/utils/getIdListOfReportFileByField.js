const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { ReportFile } = require("models");
const { Op } = require("sequelize");

const getIdListOfReportFileByField = async (fieldName, fieldValue, isArray) => {
  try {
    let isValidField = false;

    const reportFileProperties = [
      "id",
      "reportRequestId",
      "fileUrl",
      "format",
      "signedUrl",
      "signedUrlExpiry",
      "downloadCount",
    ];

    isValidField = reportFileProperties.includes(fieldName);

    if (!isValidField) {
      throw new BadRequestError(`Invalid field name: ${fieldName}.`);
    }

    const expectedType = typeof ReportFile[fieldName];

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

    let reportFileIdList = await ReportFile.findAll(options);

    if (!reportFileIdList || reportFileIdList.length === 0) {
      throw new NotFoundError(
        `ReportFile with the specified criteria not found`,
      );
    }

    reportFileIdList = reportFileIdList.map((item) => item.id);
    return reportFileIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingReportFileIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfReportFileByField;
