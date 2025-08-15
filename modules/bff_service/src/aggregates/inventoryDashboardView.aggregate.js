const { elasticClient } = require("common/elasticsearch");

const inventoryDashboardViewAggregateData = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];

    const result = await elasticClient.search({
      index: "salesai1_inventoryItem",
      body: {
        query: { terms: { id: idList } },
        _source: [
          "id",
          "storeId",
          "productId",
          "quantity",
          "status",
          "lowStockThreshold",
        ],
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(storeInfoAggregateDataFromIndex(source));

      promises.push(lowStockAlertsAggregateDataFromIndex(source));

      promises.push(statusLabelLookupDataFromIndex(source));

      promises.push(inventoryStatsStatDataFromIndex(source));

      await Promise.all(promises);

      await elasticClient.index({
        index: "salesai1_inventorydashboardview",
        id: source["id"],
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in inventoryItemAggregateData", error);
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

const storeInfoReInventoryDashboardView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "salesai1_inventorydashboardview",
      body: {
        query: { terms: { "store.id": idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(storeInfoAggregateDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "salesai1_inventorydashboardview",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in storeReAggregateinventoryDashboardView", error);
  }
};

const lowStockAlertsAggregateDataFromIndex = async (source) => {
  const aggregation = await elasticClient.search({
    index: "salesai1_lowStockAlert",
    body: {
      query: {
        match: {
          inventoryItemId: source["id"],
        },
      },
      _source: ["id", "alertType", "alertTimestamp", "resolved"],
    },
  });

  source["lowStockAlerts"] = aggregation.hits.hits.map((hit) => hit._source);
};

const lowStockAlertsReInventoryDashboardView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "salesai1_inventorydashboardview",
      body: {
        query: { terms: { "lowStockAlert.inventoryItemId": idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(lowStockAlertsAggregateDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "salesai1_inventorydashboardview",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log(
      "Error in lowStockAlertReAggregateinventoryDashboardView",
      error,
    );
  }
};

const statusLabelLookupDataFromIndex = async (source) => {
  const query = {
    match: {
      id: source["status"],
    },
  };

  const lookupData = await elasticClient.search({
    index: "salesai1_inventoryStatus",
    body: {
      query: query,
    },
  });

  if (lookupData.hits && lookupData.hits?.hits?.length > 1) {
    source["status"] = lookupData.hits.hits[0]?._source;
  }
};

const statusLabelReinventoryDashboardView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "salesai1_inventorydashboardview",
      body: {
        query: { terms: { status: idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(statusLabelLookupDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "salesai1_inventorydashboardview",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in statusLabelReinventoryDashboardView", error);
  }
};

const inventoryStatsStatDataFromIndex = async (source) => {
  let aggs = {};

  aggs["count"] = {
    count: {
      field: "id",
    },
  };

  aggs["count"] = {
    count: {
      field: "id",
    },
  };

  const statObject = await elasticClient.search({
    index: "salesai1_inventoryItem",
    body: {
      size: 0,
      aggs: aggs,
    },
  });

  source["inventoryItem"] = {};

  source["inventoryItem"]["totalProducts"] =
    statObject.aggregations["count"].value;

  source["inventoryItem"]["lowStockCount"] =
    statObject.aggregations["count"].value;
};

module.exports = {
  inventoryDashboardViewAggregateData,

  storeInfoReInventoryDashboardView,
  lowStockAlertsReInventoryDashboardView,
  statusLabelReinventoryDashboardView,
  storeInfoAggregateDataFromIndex,
  lowStockAlertsAggregateDataFromIndex,
  statusLabelLookupDataFromIndex,
  inventoryStatsStatDataFromIndex,
};
