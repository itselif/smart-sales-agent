const {
  getOpenApiSchemaById,
  getIdListOfOpenApiSchemaByField,
} = require("dbLayer");
const path = require("path");
const fs = require("fs");
const { ElasticIndexer } = require("serviceCommon");

const indexOpenApiSchemaData = async () => {
  const openApiSchemaIndexer = new ElasticIndexer("openApiSchema", {
    isSilent: true,
  });
  console.log("Starting to update indexes for OpenApiSchema");

  const idList =
    (await getIdListOfOpenApiSchemaByField("isActive", true)) ?? [];
  const chunkSize = 500;
  let total = 0;
  for (let i = 0; i < idList.length; i += chunkSize) {
    const chunk = idList.slice(i, i + chunkSize);
    const dataList = await getOpenApiSchemaById(chunk);
    if (dataList.length) {
      await openApiSchemaIndexer.indexBulkData(dataList);
      await openApiSchemaIndexer.deleteRedisCache();
    }
    total += dataList.length;
  }

  return total;
};

const syncElasticIndexData = async () => {
  const startTime = new Date();
  console.log("syncElasticIndexData started", startTime);

  try {
    const dataCount = await indexOpenApiSchemaData();
    console.log(
      "OpenApiSchema agregated data is indexed, total openApiSchemas:",
      dataCount,
    );
  } catch (err) {
    console.log(
      "Elastic Index Error When Syncing OpenApiSchema data",
      err.toString(),
    );
  }

  const elapsedTime = new Date() - startTime;
  console.log("initElasticIndexData ended -> elapsedTime:", elapsedTime);
};

module.exports = syncElasticIndexData;
