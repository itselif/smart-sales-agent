const { HttpServerError, BadRequestError } = require("common");

const { OpenApiSchema } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getOpenApiSchemaByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const openApiSchema = await OpenApiSchema.findOne({
      where: { ...query, isActive: true },
    });

    if (!openApiSchema) return null;
    return openApiSchema.getData();
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingOpenApiSchemaByQuery",
      err,
    );
  }
};

module.exports = getOpenApiSchemaByQuery;
