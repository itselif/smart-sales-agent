const { HttpServerError, BadRequestError } = require("common");

const { ElasticIndexer } = require("serviceCommon");

const { Store } = require("models");
const { hexaLogger, newUUID } = require("common");

const indexDataToElastic = async (data) => {
  const elasticIndexer = new ElasticIndexer(
    "store",
    this.session,
    this.requestId,
  );
  await elasticIndexer.indexData(data);
};

const validateData = (data) => {
  const requiredFields = ["name", "active"];

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

const createStore = async (data) => {
  try {
    validateData(data);

    const newstore = await Store.create(data);
    const _data = newstore.getData();
    await indexDataToElastic(_data);
    return _data;
  } catch (err) {
    throw new HttpServerError("errMsg_dbErrorWhenCreatingStore", err);
  }
};

module.exports = createStore;
