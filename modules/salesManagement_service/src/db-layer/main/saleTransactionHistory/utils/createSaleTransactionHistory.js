const { HttpServerError, BadRequestError } = require("common");

const { ElasticIndexer } = require("serviceCommon");

const { SaleTransactionHistory } = require("models");
const { hexaLogger, newUUID } = require("common");

const indexDataToElastic = async (data) => {
  const elasticIndexer = new ElasticIndexer(
    "saleTransactionHistory",
    this.session,
    this.requestId,
  );
  await elasticIndexer.indexData(data);
};

const validateData = (data) => {
  const requiredFields = [
    "transactionId",
    "changeType",
    "changedByUserId",
    "changeTimestamp",
    "previousData",
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

const createSaleTransactionHistory = async (data) => {
  try {
    validateData(data);

    const newsaleTransactionHistory = await SaleTransactionHistory.create(data);
    const _data = newsaleTransactionHistory.getData();
    await indexDataToElastic(_data);
    return _data;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenCreatingSaleTransactionHistory",
      err,
    );
  }
};

module.exports = createSaleTransactionHistory;
