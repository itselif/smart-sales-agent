const { getStoreById, getIdListOfStoreByField } = require("dbLayer");
const {
  getStoreAssignmentById,
  getIdListOfStoreAssignmentByField,
} = require("dbLayer");
const path = require("path");
const fs = require("fs");
const { ElasticIndexer } = require("serviceCommon");

const indexStoreData = async () => {
  const storeIndexer = new ElasticIndexer("store", { isSilent: true });
  console.log("Starting to update indexes for Store");

  const idList = (await getIdListOfStoreByField("isActive", true)) ?? [];
  const chunkSize = 500;
  let total = 0;
  for (let i = 0; i < idList.length; i += chunkSize) {
    const chunk = idList.slice(i, i + chunkSize);
    const dataList = await getStoreById(chunk);
    if (dataList.length) {
      await storeIndexer.indexBulkData(dataList);
      await storeIndexer.deleteRedisCache();
    }
    total += dataList.length;
  }

  return total;
};

const indexStoreAssignmentData = async () => {
  const storeAssignmentIndexer = new ElasticIndexer("storeAssignment", {
    isSilent: true,
  });
  console.log("Starting to update indexes for StoreAssignment");

  const idList =
    (await getIdListOfStoreAssignmentByField("isActive", true)) ?? [];
  const chunkSize = 500;
  let total = 0;
  for (let i = 0; i < idList.length; i += chunkSize) {
    const chunk = idList.slice(i, i + chunkSize);
    const dataList = await getStoreAssignmentById(chunk);
    if (dataList.length) {
      await storeAssignmentIndexer.indexBulkData(dataList);
      await storeAssignmentIndexer.deleteRedisCache();
    }
    total += dataList.length;
  }

  return total;
};

const syncElasticIndexData = async () => {
  const startTime = new Date();
  console.log("syncElasticIndexData started", startTime);

  try {
    const dataCount = await indexStoreData();
    console.log("Store agregated data is indexed, total stores:", dataCount);
  } catch (err) {
    console.log("Elastic Index Error When Syncing Store data", err.toString());
  }

  try {
    const dataCount = await indexStoreAssignmentData();
    console.log(
      "StoreAssignment agregated data is indexed, total storeAssignments:",
      dataCount,
    );
  } catch (err) {
    console.log(
      "Elastic Index Error When Syncing StoreAssignment data",
      err.toString(),
    );
  }

  const elapsedTime = new Date() - startTime;
  console.log("initElasticIndexData ended -> elapsedTime:", elapsedTime);
};

module.exports = syncElasticIndexData;
