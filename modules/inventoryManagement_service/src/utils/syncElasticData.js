const {
  getInventoryItemById,
  getIdListOfInventoryItemByField,
} = require("dbLayer");
const {
  getInventoryMovementById,
  getIdListOfInventoryMovementByField,
} = require("dbLayer");
const {
  getLowStockAlertById,
  getIdListOfLowStockAlertByField,
} = require("dbLayer");
const path = require("path");
const fs = require("fs");
const { ElasticIndexer } = require("serviceCommon");

const indexInventoryItemData = async () => {
  const inventoryItemIndexer = new ElasticIndexer("inventoryItem", {
    isSilent: true,
  });
  console.log("Starting to update indexes for InventoryItem");

  const idList =
    (await getIdListOfInventoryItemByField("isActive", true)) ?? [];
  const chunkSize = 500;
  let total = 0;
  for (let i = 0; i < idList.length; i += chunkSize) {
    const chunk = idList.slice(i, i + chunkSize);
    const dataList = await getInventoryItemById(chunk);
    if (dataList.length) {
      await inventoryItemIndexer.indexBulkData(dataList);
      await inventoryItemIndexer.deleteRedisCache();
    }
    total += dataList.length;
  }

  return total;
};

const indexInventoryMovementData = async () => {
  const inventoryMovementIndexer = new ElasticIndexer("inventoryMovement", {
    isSilent: true,
  });
  console.log("Starting to update indexes for InventoryMovement");

  const idList =
    (await getIdListOfInventoryMovementByField("isActive", true)) ?? [];
  const chunkSize = 500;
  let total = 0;
  for (let i = 0; i < idList.length; i += chunkSize) {
    const chunk = idList.slice(i, i + chunkSize);
    const dataList = await getInventoryMovementById(chunk);
    if (dataList.length) {
      await inventoryMovementIndexer.indexBulkData(dataList);
      await inventoryMovementIndexer.deleteRedisCache();
    }
    total += dataList.length;
  }

  return total;
};

const indexLowStockAlertData = async () => {
  const lowStockAlertIndexer = new ElasticIndexer("lowStockAlert", {
    isSilent: true,
  });
  console.log("Starting to update indexes for LowStockAlert");

  const idList =
    (await getIdListOfLowStockAlertByField("isActive", true)) ?? [];
  const chunkSize = 500;
  let total = 0;
  for (let i = 0; i < idList.length; i += chunkSize) {
    const chunk = idList.slice(i, i + chunkSize);
    const dataList = await getLowStockAlertById(chunk);
    if (dataList.length) {
      await lowStockAlertIndexer.indexBulkData(dataList);
      await lowStockAlertIndexer.deleteRedisCache();
    }
    total += dataList.length;
  }

  return total;
};

const syncElasticIndexData = async () => {
  const startTime = new Date();
  console.log("syncElasticIndexData started", startTime);

  try {
    const dataCount = await indexInventoryItemData();
    console.log(
      "InventoryItem agregated data is indexed, total inventoryItems:",
      dataCount,
    );
  } catch (err) {
    console.log(
      "Elastic Index Error When Syncing InventoryItem data",
      err.toString(),
    );
  }

  try {
    const dataCount = await indexInventoryMovementData();
    console.log(
      "InventoryMovement agregated data is indexed, total inventoryMovements:",
      dataCount,
    );
  } catch (err) {
    console.log(
      "Elastic Index Error When Syncing InventoryMovement data",
      err.toString(),
    );
  }

  try {
    const dataCount = await indexLowStockAlertData();
    console.log(
      "LowStockAlert agregated data is indexed, total lowStockAlerts:",
      dataCount,
    );
  } catch (err) {
    console.log(
      "Elastic Index Error When Syncing LowStockAlert data",
      err.toString(),
    );
  }

  const elapsedTime = new Date() - startTime;
  console.log("initElasticIndexData ended -> elapsedTime:", elapsedTime);
};

module.exports = syncElasticIndexData;
