const { elasticClient } = require("common/elasticsearch");

const crossStoreComparisonViewAggregateData = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];

    const result = await elasticClient.search({
      index: "salesai1_store",
      body: {
        query: { terms: { id: idList } },
        _source: ["id", "name", "city", "avatar", "active"],
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(activeSellersAggregateDataFromIndex(source));

      promises.push(activeManagersAggregateDataFromIndex(source));

      promises.push(salesStatsStatDataFromIndex(source));

      promises.push(inventoryStatsStatDataFromIndex(source));

      promises.push(alertStatsStatDataFromIndex(source));

      await Promise.all(promises);

      await elasticClient.index({
        index: "salesai1_crossstorecomparisonview",
        id: source["id"],
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in storeAggregateData", error);
  }
};

const activeSellersAggregateDataFromIndex = async (source) => {
  const aggregation = await elasticClient.search({
    index: "salesai1_storeAssignment",
    body: {
      query: {
        match: {
          storeId: source["id"],
        },
      },
      _source: ["userId", "role", "status"],
    },
  });

  source["activeSellers"] = aggregation.hits.hits.map((hit) => hit._source);
};

const activeSellersReCrossStoreComparisonView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "salesai1_crossstorecomparisonview",
      body: {
        query: { terms: { "storeAssignment.storeId": idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(activeSellersAggregateDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "salesai1_crossstorecomparisonview",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log(
      "Error in storeAssignmentReAggregatecrossStoreComparisonView",
      error,
    );
  }
};

const activeManagersAggregateDataFromIndex = async (source) => {
  const aggregation = await elasticClient.search({
    index: "salesai1_storeAssignment",
    body: {
      query: {
        match: {
          storeId: source["id"],
        },
      },
      _source: ["userId", "role", "status"],
    },
  });

  source["activeManagers"] = aggregation.hits.hits.map((hit) => hit._source);
};

const activeManagersReCrossStoreComparisonView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "salesai1_crossstorecomparisonview",
      body: {
        query: { terms: { "storeAssignment.storeId": idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(activeManagersAggregateDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "salesai1_crossstorecomparisonview",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log(
      "Error in storeAssignmentReAggregatecrossStoreComparisonView",
      error,
    );
  }
};

const salesStatsStatDataFromIndex = async (source) => {
  let aggs = {};

  aggs["count"] = {
    count: {
      field: "id",
    },
  };

  aggs["sum"] = {
    sum: {
      field: "amount",
    },
  };

  const statObject = await elasticClient.search({
    index: "salesai1_saleTransaction",
    body: {
      size: 0,
      aggs: aggs,
    },
  });

  source["saleTransaction"] = {};

  source["saleTransaction"]["totalSales"] =
    statObject.aggregations["count"].value;

  source["saleTransaction"]["salesAmount"] =
    statObject.aggregations["sum"].value;
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

  source["inventoryItem"]["productsInStock"] =
    statObject.aggregations["count"].value;

  source["inventoryItem"]["lowStockProducts"] =
    statObject.aggregations["count"].value;
};

const alertStatsStatDataFromIndex = async (source) => {
  let aggs = {};

  aggs["count"] = {
    count: {
      field: "id",
    },
  };

  const statObject = await elasticClient.search({
    index: "salesai1_lowStockAlert",
    body: {
      size: 0,
      aggs: aggs,
    },
  });

  source["lowStockAlert"] = {};

  source["lowStockAlert"]["openLowStockAlerts"] =
    statObject.aggregations["count"].value;
};

module.exports = {
  crossStoreComparisonViewAggregateData,

  activeSellersReCrossStoreComparisonView,
  activeManagersReCrossStoreComparisonView,

  activeSellersAggregateDataFromIndex,
  activeManagersAggregateDataFromIndex,

  salesStatsStatDataFromIndex,
  inventoryStatsStatDataFromIndex,
  alertStatsStatDataFromIndex,
};
