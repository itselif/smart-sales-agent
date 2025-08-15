const { elasticClient } = require("common/elasticsearch");

const getAllLowStockAlertView = async (filter = null) => {
  try {
    const query = filter ? { match: filter } : { match_all: {} };
    const result = await elasticClient.search({
      index: "salesai1_lowStockAlert",
      body: {
        query: query,
        _source: [
          "id",
          "inventoryItemId",
          "storeId",
          "alertType",
          "alertTimestamp",
          "resolved",
          "resolvedByUserId",
          "resolvedTimestamp",
        ],
      },
    });

    const response = [];
    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(inventoryItemAggregateDataFromIndex(source));

      promises.push(storeInfoAggregateDataFromIndex(source));

      promises.push(storeSellersAggregateDataFromIndex(source));

      promises.push(storeManagersAggregateDataFromIndex(source));

      promises.push(alertTypeLabelLookupDataFromIndex(source));

      await Promise.all(promises);
      response.push(source);
    }
    return response;
  } catch (error) {
    console.log("Error in lowStockAlertAggregateData", error);
  }
};

const getLowStockAlertView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "salesai1_lowStockAlert",
      body: {
        query: { terms: { id: idList } },
        _source: [
          "id",
          "inventoryItemId",
          "storeId",
          "alertType",
          "alertTimestamp",
          "resolved",
          "resolvedByUserId",
          "resolvedTimestamp",
        ],
      },
    });

    const response = [];
    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(inventoryItemAggregateDataFromIndex(source));

      promises.push(storeInfoAggregateDataFromIndex(source));

      promises.push(storeSellersAggregateDataFromIndex(source));

      promises.push(storeManagersAggregateDataFromIndex(source));

      promises.push(alertTypeLabelLookupDataFromIndex(source));

      await Promise.all(promises);
      response.push(source);
    }
    return response;
  } catch (error) {
    console.log("Error in lowStockAlertAggregateData", error);
  }
};

const inventoryItemAggregateDataFromIndex = async (source) => {
  const aggregation = await elasticClient.search({
    index: "salesai1_inventoryItem",
    body: {
      query: {
        match: {
          id: source["inventoryItemId"],
        },
      },
      _source: ["productId", "quantity", "status", "lowStockThreshold"],
    },
  });

  if (aggregation.hits.hits.length > 0) {
    source["inventoryItem"] = aggregation.hits.hits[0]?._source;
  }
};

const storeInfoAggregateDataFromIndex = async (source) => {
  const aggregation = await elasticClient.search({
    index: "salesai1_store",
    body: {
      query: {
        match: {
          id: source["storeId"],
        },
      },
      _source: ["id", "name", "city", "avatar", "active"],
    },
  });

  if (aggregation.hits.hits.length > 0) {
    source["storeInfo"] = aggregation.hits.hits[0]?._source;
  }
};

const storeSellersAggregateDataFromIndex = async (source) => {
  const aggregation = await elasticClient.search({
    index: "salesai1_storeAssignment",
    body: {
      query: {
        match: {
          storeId: source["storeId"],
        },
      },
      _source: ["userId", "role", "status"],
    },
  });

  source["storeSellers"] = aggregation.hits.hits.map((hit) => hit._source);
};

const storeManagersAggregateDataFromIndex = async (source) => {
  const aggregation = await elasticClient.search({
    index: "salesai1_storeAssignment",
    body: {
      query: {
        match: {
          storeId: source["storeId"],
        },
      },
      _source: ["userId", "role", "status"],
    },
  });

  source["storeManagers"] = aggregation.hits.hits.map((hit) => hit._source);
};

const alertTypeLabelLookupDataFromIndex = async (source) => {
  const query = {
    match: {
      id: source["alertType"],
    },
  };

  const lookupData = await elasticClient.search({
    index: "salesai1_inventoryAlertType",
    body: {
      query: query,
    },
  });

  if (lookupData.hits && lookupData.hits?.hits?.length > 1) {
    source["alertType"] = lookupData.hits.hits[0]?._source;
  }
};

module.exports = {
  getAllLowStockAlertView,
  getLowStockAlertView,
  inventoryItemAggregateDataFromIndex,
  storeInfoAggregateDataFromIndex,
  storeSellersAggregateDataFromIndex,
  storeManagersAggregateDataFromIndex,
  alertTypeLabelLookupDataFromIndex,
};
