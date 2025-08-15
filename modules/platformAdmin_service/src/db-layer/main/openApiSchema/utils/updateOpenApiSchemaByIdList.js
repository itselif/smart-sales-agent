const { HttpServerError } = require("common");

const { OpenApiSchema } = require("models");
const { Op } = require("sequelize");

const updateOpenApiSchemaByIdList = async (idList, dataClause) => {
  try {
    let rowsCount = null;
    let rows = null;

    const options = {
      where: { id: { [Op.in]: idList }, isActive: true },
      returning: true,
    };

    [rowsCount, rows] = await OpenApiSchema.update(dataClause, options);
    const openApiSchemaIdList = rows.map((item) => item.id);
    return openApiSchemaIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenUpdatingOpenApiSchemaByIdList",
      err,
    );
  }
};

module.exports = updateOpenApiSchemaByIdList;
