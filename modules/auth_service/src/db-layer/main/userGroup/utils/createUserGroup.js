const { HttpServerError, BadRequestError } = require("common");

const { ElasticIndexer } = require("serviceCommon");

const { UserGroup } = require("models");
const { hexaLogger, newUUID } = require("common");

const indexDataToElastic = async (data) => {
  const elasticIndexer = new ElasticIndexer(
    "userGroup",
    this.session,
    this.requestId,
  );
  await elasticIndexer.indexData(data);
};

const validateData = (data) => {
  const requiredFields = ["groupName"];

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

const createUserGroup = async (data) => {
  try {
    validateData(data);

    const newuserGroup = await UserGroup.create(data);
    const _data = newuserGroup.getData();
    await indexDataToElastic(_data);
    return _data;
  } catch (err) {
    throw new HttpServerError("errMsg_dbErrorWhenCreatingUserGroup", err);
  }
};

module.exports = createUserGroup;
