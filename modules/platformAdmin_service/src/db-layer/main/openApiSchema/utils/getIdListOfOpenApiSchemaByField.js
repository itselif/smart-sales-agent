const { HttpServerError, NotFoundError, BadRequestError } = require("common");

const { OpenApiSchema } = require("models");
const { Op } = require("sequelize");

const getIdListOfOpenApiSchemaByField = async (
  fieldName,
  fieldValue,
  isArray,
) => {
  try {
    let isValidField = false;

    const openApiSchemaProperties = [
      "id",
      "version",
      "description",
      "schemaJson",
    ];

    isValidField = openApiSchemaProperties.includes(fieldName);

    if (!isValidField) {
      throw new BadRequestError(`Invalid field name: ${fieldName}.`);
    }

    const expectedType = typeof OpenApiSchema[fieldName];

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

    let openApiSchemaIdList = await OpenApiSchema.findAll(options);

    if (!openApiSchemaIdList || openApiSchemaIdList.length === 0) {
      throw new NotFoundError(
        `OpenApiSchema with the specified criteria not found`,
      );
    }

    openApiSchemaIdList = openApiSchemaIdList.map((item) => item.id);
    return openApiSchemaIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingOpenApiSchemaIdListByField",
      err,
    );
  }
};

module.exports = getIdListOfOpenApiSchemaByField;
