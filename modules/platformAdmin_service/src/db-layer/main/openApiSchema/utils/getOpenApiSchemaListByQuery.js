const { HttpServerError, BadRequestError } = require("common");

const { OpenApiSchema } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const getOpenApiSchemaListByQuery = async (query) => {
  try {
    if (!query || typeof query !== "object") {
      throw new BadRequestError(
        "Invalid query provided. Query must be an object.",
      );
    }

    const openApiSchema = await OpenApiSchema.findAll({
      where: { ...query, isActive: true },
    });

    //should i add not found error or only return empty array?
    if (!openApiSchema || openApiSchema.length === 0) return [];

    //      if (!openApiSchema || openApiSchema.length === 0) {
    //      throw new NotFoundError(
    //      `OpenApiSchema with the specified criteria not found`
    //  );
    //}

    return openApiSchema.map((item) => item.getData());
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingOpenApiSchemaListByQuery",
      err,
    );
  }
};

module.exports = getOpenApiSchemaListByQuery;
