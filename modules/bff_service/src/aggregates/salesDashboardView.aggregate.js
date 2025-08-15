const { elasticClient } = require("common/elasticsearch");

const salesDashboardViewAggregateData = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];

    const result = await elasticClient.search({
      index: "salesai1_saleTransaction",
      body: {
        query: { terms: { id: idList } },
        _source: [
          "id",
          "transactionDate",
          "amount",
          "currency",
          "status",
          "sellerId",
          "storeId",
        ],
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(storeInfoAggregateDataFromIndex(source));

      promises.push(sellerInfoAggregateDataFromIndex(source));

      promises.push(statusLabelLookupDataFromIndex(source));

      promises.push(storeSalesStatsStatDataFromIndex(source));

      await Promise.all(promises);

      await elasticClient.index({
        index: "salesai1_salesdashboardview",
        id: source["id"],
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in saleTransactionAggregateData", error);
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
      _source: ["id", "name", "city", "avatar"],
    },
  });

  if (aggregation.hits.hits.length > 0) {
    source["storeInfo"] = aggregation.hits.hits[0]?._source;
  }
};

const storeInfoReSalesDashboardView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "salesai1_salesdashboardview",
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
        index: "salesai1_salesdashboardview",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in storeReAggregatesalesDashboardView", error);
  }
};

const sellerInfoAggregateDataFromIndex = async (source) => {
  const aggregation = await elasticClient.search({
    index: "salesai1_user",
    body: {
      query: {
        match: {
          id: source["sellerId"],
        },
      },
      _source: ["id", "fullName", "email", "username"],
    },
  });

  if (aggregation.hits.hits.length > 0) {
    source["sellerInfo"] = aggregation.hits.hits[0]?._source;
  }
};

const sellerInfoReSalesDashboardView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "salesai1_salesdashboardview",
      body: {
        query: { terms: { "user.id": idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(sellerInfoAggregateDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "salesai1_salesdashboardview",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in userReAggregatesalesDashboardView", error);
  }
};

const statusLabelLookupDataFromIndex = async (source) => {
  const query = {
    match: {
      id: source["status"],
    },
  };

  const lookupData = await elasticClient.search({
    index: "salesai1_saleTransactionStatus",
    body: {
      query: query,
    },
  });

  if (lookupData.hits && lookupData.hits?.hits?.length > 1) {
    source["status"] = lookupData.hits.hits[0]?._source;
  }
};

const statusLabelResalesDashboardView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "salesai1_salesdashboardview",
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
        index: "salesai1_salesdashboardview",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in statusLabelResalesDashboardView", error);
  }
};

const storeSalesStatsStatDataFromIndex = async (source) => {
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

  source["saleTransaction"]["totalSalesCount"] =
    statObject.aggregations["count"].value;

  source["saleTransaction"]["totalSalesAmount"] =
    statObject.aggregations["sum"].value;
};

module.exports = {
  salesDashboardViewAggregateData,

  storeInfoReSalesDashboardView,
  sellerInfoReSalesDashboardView,
  statusLabelResalesDashboardView,
  storeInfoAggregateDataFromIndex,
  sellerInfoAggregateDataFromIndex,
  statusLabelLookupDataFromIndex,
  storeSalesStatsStatDataFromIndex,
};
