const { getAuditLogById, getIdListOfAuditLogByField } = require("dbLayer");
const {
  getMetricDatapointById,
  getIdListOfMetricDatapointByField,
} = require("dbLayer");
const {
  getAnomalyEventById,
  getIdListOfAnomalyEventByField,
} = require("dbLayer");
const path = require("path");
const fs = require("fs");
const { ElasticIndexer } = require("serviceCommon");

const indexAuditLogData = async () => {
  const auditLogIndexer = new ElasticIndexer("auditLog", { isSilent: true });
  console.log("Starting to update indexes for AuditLog");

  const idList = (await getIdListOfAuditLogByField("isActive", true)) ?? [];
  const chunkSize = 500;
  let total = 0;
  for (let i = 0; i < idList.length; i += chunkSize) {
    const chunk = idList.slice(i, i + chunkSize);
    const dataList = await getAuditLogById(chunk);
    if (dataList.length) {
      await auditLogIndexer.indexBulkData(dataList);
      await auditLogIndexer.deleteRedisCache();
    }
    total += dataList.length;
  }

  return total;
};

const indexMetricDatapointData = async () => {
  const metricDatapointIndexer = new ElasticIndexer("metricDatapoint", {
    isSilent: true,
  });
  console.log("Starting to update indexes for MetricDatapoint");

  const idList =
    (await getIdListOfMetricDatapointByField("isActive", true)) ?? [];
  const chunkSize = 500;
  let total = 0;
  for (let i = 0; i < idList.length; i += chunkSize) {
    const chunk = idList.slice(i, i + chunkSize);
    const dataList = await getMetricDatapointById(chunk);
    if (dataList.length) {
      await metricDatapointIndexer.indexBulkData(dataList);
      await metricDatapointIndexer.deleteRedisCache();
    }
    total += dataList.length;
  }

  return total;
};

const indexAnomalyEventData = async () => {
  const anomalyEventIndexer = new ElasticIndexer("anomalyEvent", {
    isSilent: true,
  });
  console.log("Starting to update indexes for AnomalyEvent");

  const idList = (await getIdListOfAnomalyEventByField("isActive", true)) ?? [];
  const chunkSize = 500;
  let total = 0;
  for (let i = 0; i < idList.length; i += chunkSize) {
    const chunk = idList.slice(i, i + chunkSize);
    const dataList = await getAnomalyEventById(chunk);
    if (dataList.length) {
      await anomalyEventIndexer.indexBulkData(dataList);
      await anomalyEventIndexer.deleteRedisCache();
    }
    total += dataList.length;
  }

  return total;
};

const syncElasticIndexData = async () => {
  const startTime = new Date();
  console.log("syncElasticIndexData started", startTime);

  try {
    const dataCount = await indexAuditLogData();
    console.log(
      "AuditLog agregated data is indexed, total auditLogs:",
      dataCount,
    );
  } catch (err) {
    console.log(
      "Elastic Index Error When Syncing AuditLog data",
      err.toString(),
    );
  }

  try {
    const dataCount = await indexMetricDatapointData();
    console.log(
      "MetricDatapoint agregated data is indexed, total metricDatapoints:",
      dataCount,
    );
  } catch (err) {
    console.log(
      "Elastic Index Error When Syncing MetricDatapoint data",
      err.toString(),
    );
  }

  try {
    const dataCount = await indexAnomalyEventData();
    console.log(
      "AnomalyEvent agregated data is indexed, total anomalyEvents:",
      dataCount,
    );
  } catch (err) {
    console.log(
      "Elastic Index Error When Syncing AnomalyEvent data",
      err.toString(),
    );
  }

  const elapsedTime = new Date() - startTime;
  console.log("initElasticIndexData ended -> elapsedTime:", elapsedTime);
};

module.exports = syncElasticIndexData;
