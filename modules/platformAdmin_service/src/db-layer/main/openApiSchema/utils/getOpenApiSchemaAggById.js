const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { OpenApiSchema } = require("models");
const { Op } = require("sequelize");

const getOpenApiSchemaAggById = async (openApiSchemaId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const openApiSchema = Array.isArray(openApiSchemaId)
      ? await OpenApiSchema.findAll({
          where: {
            id: { [Op.in]: openApiSchemaId },
            isActive: true,
          },
          include: includes,
        })
      : await OpenApiSchema.findOne({
          where: {
            id: openApiSchemaId,
            isActive: true,
          },
          include: includes,
        });

    if (!openApiSchema) {
      return null;
    }

    const openApiSchemaData =
      Array.isArray(openApiSchemaId) && openApiSchemaId.length > 0
        ? openApiSchema.map((item) => item.getData())
        : openApiSchema.getData();
    await OpenApiSchema.getCqrsJoins(openApiSchemaData);
    return openApiSchemaData;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingOpenApiSchemaAggById",
      err,
    );
  }
};

module.exports = getOpenApiSchemaAggById;
