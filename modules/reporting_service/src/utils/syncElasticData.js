const {
  getReportRequestById,
  getIdListOfReportRequestByField,
} = require("dbLayer");
const { getReportFileById, getIdListOfReportFileByField } = require("dbLayer");
const {
  getReportPolicyById,
  getIdListOfReportPolicyByField,
} = require("dbLayer");
const path = require("path");
const fs = require("fs");
const { ElasticIndexer } = require("serviceCommon");

const indexReportRequestData = async () => {
  const reportRequestIndexer = new ElasticIndexer("reportRequest", {
    isSilent: true,
  });
  console.log("Starting to update indexes for ReportRequest");

  const idList =
    (await getIdListOfReportRequestByField("isActive", true)) ?? [];
  const chunkSize = 500;
  let total = 0;
  for (let i = 0; i < idList.length; i += chunkSize) {
    const chunk = idList.slice(i, i + chunkSize);
    const dataList = await getReportRequestById(chunk);
    if (dataList.length) {
      await reportRequestIndexer.indexBulkData(dataList);
      await reportRequestIndexer.deleteRedisCache();
    }
    total += dataList.length;
  }

  return total;
};

const indexReportFileData = async () => {
  const reportFileIndexer = new ElasticIndexer("reportFile", {
    isSilent: true,
  });
  console.log("Starting to update indexes for ReportFile");

  const idList = (await getIdListOfReportFileByField("isActive", true)) ?? [];
  const chunkSize = 500;
  let total = 0;
  for (let i = 0; i < idList.length; i += chunkSize) {
    const chunk = idList.slice(i, i + chunkSize);
    const dataList = await getReportFileById(chunk);
    if (dataList.length) {
      await reportFileIndexer.indexBulkData(dataList);
      await reportFileIndexer.deleteRedisCache();
    }
    total += dataList.length;
  }

  return total;
};

const indexReportPolicyData = async () => {
  const reportPolicyIndexer = new ElasticIndexer("reportPolicy", {
    isSilent: true,
  });
  console.log("Starting to update indexes for ReportPolicy");

  const idList = (await getIdListOfReportPolicyByField("isActive", true)) ?? [];
  const chunkSize = 500;
  let total = 0;
  for (let i = 0; i < idList.length; i += chunkSize) {
    const chunk = idList.slice(i, i + chunkSize);
    const dataList = await getReportPolicyById(chunk);
    if (dataList.length) {
      await reportPolicyIndexer.indexBulkData(dataList);
      await reportPolicyIndexer.deleteRedisCache();
    }
    total += dataList.length;
  }

  return total;
};

const syncElasticIndexData = async () => {
  const startTime = new Date();
  console.log("syncElasticIndexData started", startTime);

  try {
    const dataCount = await indexReportRequestData();
    console.log(
      "ReportRequest agregated data is indexed, total reportRequests:",
      dataCount,
    );
  } catch (err) {
    console.log(
      "Elastic Index Error When Syncing ReportRequest data",
      err.toString(),
    );
  }

  try {
    const dataCount = await indexReportFileData();
    console.log(
      "ReportFile agregated data is indexed, total reportFiles:",
      dataCount,
    );
  } catch (err) {
    console.log(
      "Elastic Index Error When Syncing ReportFile data",
      err.toString(),
    );
  }

  try {
    const dataCount = await indexReportPolicyData();
    console.log(
      "ReportPolicy agregated data is indexed, total reportPolicies:",
      dataCount,
    );
  } catch (err) {
    console.log(
      "Elastic Index Error When Syncing ReportPolicy data",
      err.toString(),
    );
  }

  const elapsedTime = new Date() - startTime;
  console.log("initElasticIndexData ended -> elapsedTime:", elapsedTime);
};

module.exports = syncElasticIndexData;
