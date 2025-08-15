const { ElasticIndexer } = require("serviceCommon");
const { hexaLogger } = require("common");

const userMapping = {
  id: { type: "keyword" },
  _owner: { type: "keyword" },
  email: { type: "keyword", index: true },
  password: { type: "keyword", index: false },
  fullname: { type: "keyword", index: true },
  avatar: { type: "keyword", index: false },
  emailVerified: { type: "boolean", null_value: false },
  storeId: { type: "keyword", index: true },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
};
const userGroupMapping = {
  id: { type: "keyword" },
  _owner: { type: "keyword" },
  groupName: { type: "keyword", index: true },
  avatar: { type: "keyword", index: false },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
};
const userGroupMemberMapping = {
  id: { type: "keyword" },
  _owner: { type: "keyword" },
  groupId: { type: "keyword", index: true },
  userId: { type: "keyword", index: true },
  ownerId: { type: "keyword", index: true },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
};
const storeMapping = {
  id: { type: "keyword" },
  _owner: { type: "keyword" },
  name: { type: "keyword", index: true },
  codename: { type: "keyword", index: true },
  fullname: { type: "keyword", index: true },
  avatar: { type: "keyword", index: false },
  ownerId: { type: "keyword", index: true },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
};

const updateElasticIndexMappings = async () => {
  try {
    ElasticIndexer.addMapping("user", userMapping);
    await new ElasticIndexer("user").updateMapping(userMapping);
    ElasticIndexer.addMapping("userGroup", userGroupMapping);
    await new ElasticIndexer("userGroup").updateMapping(userGroupMapping);
    ElasticIndexer.addMapping("userGroupMember", userGroupMemberMapping);
    await new ElasticIndexer("userGroupMember").updateMapping(
      userGroupMemberMapping,
    );
    ElasticIndexer.addMapping("store", storeMapping);
    await new ElasticIndexer("store").updateMapping(storeMapping);
  } catch (err) {
    hexaLogger.insertError(
      "UpdateElasticIndexMappingsError",
      { function: "updateElasticIndexMappings" },
      "elastic-index.js->updateElasticIndexMappings",
      err,
    );
  }
};

module.exports = updateElasticIndexMappings;
