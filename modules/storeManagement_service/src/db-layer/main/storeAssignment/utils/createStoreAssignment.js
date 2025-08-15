const { HttpServerError, BadRequestError } = require("common");

const { ElasticIndexer } = require("serviceCommon");

const { StoreAssignment } = require("models");
const { hexaLogger, newUUID } = require("common");

const indexDataToElastic = async (data) => {
  const elasticIndexer = new ElasticIndexer(
    "storeAssignment",
    this.session,
    this.requestId,
  );
  await elasticIndexer.indexData(data);
};

const validateData = (data) => {
  const requiredFields = [
    "userId",
    "storeId",
    "role",
    "assignmentType",
    "status",
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

const createStoreAssignment = async (data) => {
  try {
    validateData(data);

    const newstoreAssignment = await StoreAssignment.create(data);
    const _data = newstoreAssignment.getData();
    await indexDataToElastic(_data);
    return _data;
  } catch (err) {
    throw new HttpServerError("errMsg_dbErrorWhenCreatingStoreAssignment", err);
  }
};

module.exports = createStoreAssignment;
