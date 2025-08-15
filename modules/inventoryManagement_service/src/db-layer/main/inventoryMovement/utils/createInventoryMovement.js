const { HttpServerError, BadRequestError } = require("common");

const { ElasticIndexer } = require("serviceCommon");

const { InventoryMovement } = require("models");
const { hexaLogger, newUUID } = require("common");

const indexDataToElastic = async (data) => {
  const elasticIndexer = new ElasticIndexer(
    "inventoryMovement",
    this.session,
    this.requestId,
  );
  await elasticIndexer.indexData(data);
};

const validateData = (data) => {
  const requiredFields = [
    "inventoryItemId",
    "quantityDelta",
    "movementType",
    "movementTimestamp",
    "userId",
    "storeId",
  ];

  requiredFields.forEach((field) => {
    if (data[field] === null || data[field] === undefined) {
      throw new BadRequestError(
        `Field "${field}" is required and cannot be null or undefined.`,
      );
    }
  });

  if (!data.id) {
    data.id = newUUID();
  }
};

const createInventoryMovement = async (data) => {
  try {
    validateData(data);

    const newinventoryMovement = await InventoryMovement.create(data);
    const _data = newinventoryMovement.getData();
    await indexDataToElastic(_data);
    return _data;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenCreatingInventoryMovement",
      err,
    );
  }
};

module.exports = createInventoryMovement;
