const { HttpServerError } = require("common");

let { OpenApiSchema } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getOpenApiSchemaById = async (openApiSchemaId) => {
  try {
    const openApiSchema = Array.isArray(openApiSchemaId)
      ? await OpenApiSchema.findAll({
          where: {
            id: { [Op.in]: openApiSchemaId },
            isActive: true,
          },
        })
      : await OpenApiSchema.findOne({
          where: {
            id: openApiSchemaId,
            isActive: true,
          },
        });

    if (!openApiSchema) {
      return null;
    }
    return Array.isArray(openApiSchemaId)
      ? openApiSchema.map((item) => item.getData())
      : openApiSchema.getData();
  } catch (err) {
    console.log(err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingOpenApiSchemaById",
      err,
    );
  }
};

module.exports = getOpenApiSchemaById;
