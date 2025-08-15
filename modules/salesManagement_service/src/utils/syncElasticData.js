const {
  getSaleTransactionById,
  getIdListOfSaleTransactionByField,
} = require("dbLayer");
const {
  getSaleTransactionHistoryById,
  getIdListOfSaleTransactionHistoryByField,
} = require("dbLayer");
const path = require("path");
const fs = require("fs");
const { ElasticIndexer } = require("serviceCommon");

const indexSaleTransactionData = async () => {
  const saleTransactionIndexer = new ElasticIndexer("saleTransaction", {
    isSilent: true,
  });
  console.log("Starting to update indexes for SaleTransaction");

  const idList =
    (await getIdListOfSaleTransactionByField("isActive", true)) ?? [];
  const chunkSize = 500;
  let total = 0;
  for (let i = 0; i < idList.length; i += chunkSize) {
    const chunk = idList.slice(i, i + chunkSize);
    const dataList = await getSaleTransactionById(chunk);
    if (dataList.length) {
      await saleTransactionIndexer.indexBulkData(dataList);
      await saleTransactionIndexer.deleteRedisCache();
    }
    total += dataList.length;
  }

  return total;
};

const indexSaleTransactionHistoryData = async () => {
  const saleTransactionHistoryIndexer = new ElasticIndexer(
    "saleTransactionHistory",
    { isSilent: true },
  );
  console.log("Starting to update indexes for SaleTransactionHistory");

  const idList =
    (await getIdListOfSaleTransactionHistoryByField("isActive", true)) ?? [];
  const chunkSize = 500;
  let total = 0;
  for (let i = 0; i < idList.length; i += chunkSize) {
    const chunk = idList.slice(i, i + chunkSize);
    const dataList = await getSaleTransactionHistoryById(chunk);
    if (dataList.length) {
      await saleTransactionHistoryIndexer.indexBulkData(dataList);
      await saleTransactionHistoryIndexer.deleteRedisCache();
    }
    total += dataList.length;
  }

  return total;
};

const syncElasticIndexData = async () => {
  const startTime = new Date();
  console.log("syncElasticIndexData started", startTime);

  try {
    const dataCount = await indexSaleTransactionData();
    console.log(
      "SaleTransaction agregated data is indexed, total saleTransactions:",
      dataCount,
    );
  } catch (err) {
    console.log(
      "Elastic Index Error When Syncing SaleTransaction data",
      err.toString(),
    );
  }

  try {
    const dataCount = await indexSaleTransactionHistoryData();
    console.log(
      "SaleTransactionHistory agregated data is indexed, total saleTransactionHistories:",
      dataCount,
    );
  } catch (err) {
    console.log(
      "Elastic Index Error When Syncing SaleTransactionHistory data",
      err.toString(),
    );
  }

  const elapsedTime = new Date() - startTime;
  console.log("initElasticIndexData ended -> elapsedTime:", elapsedTime);
};

module.exports = syncElasticIndexData;
