const { elasticClient } = require("common/elasticsearch");

const getAllSaleTransactionCorrectionAuditView = async (filter = null) => {
  try {
    const query = filter ? { match: filter } : { match_all: {} };
    const result = await elasticClient.search({
      index: "salesai1_saleTransactionHistory",
      body: {
        query: query,
        _source: [
          "id",
          "transactionId",
          "changeType",
          "changedByUserId",
          "changeTimestamp",
          "correctionJustification",
          "previousData",
          "newData",
        ],
      },
    });

    const response = [];
    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(saleTransactionAggregateDataFromIndex(source));

      promises.push(changedByUserAggregateDataFromIndex(source));

      promises.push(storeInfoAggregateDataFromIndex(source));

      promises.push(sellerInfoAggregateDataFromIndex(source));

      promises.push(changeTypeLabelLookupDataFromIndex(source));

      promises.push(statusLabelLookupDataFromIndex(source));

      await Promise.all(promises);
      response.push(source);
    }
    return response;
  } catch (error) {
    console.log("Error in saleTransactionHistoryAggregateData", error);
  }
};

const getSaleTransactionCorrectionAuditView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "salesai1_saleTransactionHistory",
      body: {
        query: { terms: { id: idList } },
        _source: [
          "id",
          "transactionId",
          "changeType",
          "changedByUserId",
          "changeTimestamp",
          "correctionJustification",
          "previousData",
          "newData",
        ],
      },
    });

    const response = [];
    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(saleTransactionAggregateDataFromIndex(source));

      promises.push(changedByUserAggregateDataFromIndex(source));

      promises.push(storeInfoAggregateDataFromIndex(source));

      promises.push(sellerInfoAggregateDataFromIndex(source));

      promises.push(changeTypeLabelLookupDataFromIndex(source));

      promises.push(statusLabelLookupDataFromIndex(source));

      await Promise.all(promises);
      response.push(source);
    }
    return response;
  } catch (error) {
    console.log("Error in saleTransactionHistoryAggregateData", error);
  }
};

const saleTransactionAggregateDataFromIndex = async (source) => {
  const aggregation = await elasticClient.search({
    index: "salesai1_saleTransaction",
    body: {
      query: {
        match: {
          id: source["transactionId"],
        },
      },
      _source: [
        "id",
        "storeId",
        "amount",
        "currency",
        "transactionDate",
        "status",
        "sellerId",
      ],
    },
  });

  if (aggregation.hits.hits.length > 0) {
    source["saleTransaction"] = aggregation.hits.hits[0]?._source;
  }
};

const changedByUserAggregateDataFromIndex = async (source) => {
  const aggregation = await elasticClient.search({
    index: "salesai1_user",
    body: {
      query: {
        match: {
          id: source["changedByUserId"],
        },
      },
      _source: ["id", "email", "fullName", "username"],
    },
  });

  if (aggregation.hits.hits.length > 0) {
    source["changedByUser"] = aggregation.hits.hits[0]?._source;
  }
};

const storeInfoAggregateDataFromIndex = async (source) => {
  const aggregation = await elasticClient.search({
    index: "salesai1_store",
    body: {
      query: {
        match: {
          id: source["saleTransaction"],
        },
      },
      _source: ["id", "name", "city", "avatar", "active"],
    },
  });

  if (aggregation.hits.hits.length > 0) {
    source["storeInfo"] = aggregation.hits.hits[0]?._source;
  }
};

const sellerInfoAggregateDataFromIndex = async (source) => {
  const aggregation = await elasticClient.search({
    index: "salesai1_user",
    body: {
      query: {
        match: {
          id: source["saleTransaction"],
        },
      },
      _source: ["id", "email", "fullName", "username"],
    },
  });

  if (aggregation.hits.hits.length > 0) {
    source["sellerInfo"] = aggregation.hits.hits[0]?._source;
  }
};

const changeTypeLabelLookupDataFromIndex = async (source) => {
  const query = {
    match: {
      id: source["changeType"],
    },
  };

  const lookupData = await elasticClient.search({
    index: "salesai1_saleChangeType",
    body: {
      query: query,
    },
  });

  if (lookupData.hits && lookupData.hits?.hits?.length > 1) {
    source["changeType"] = lookupData.hits.hits[0]?._source;
  }
};

const statusLabelLookupDataFromIndex = async (source) => {
  const query = {
    match: {
      id: source["saleTransaction.status"],
    },
  };

  const lookupData = await elasticClient.search({
    index: "salesai1_saleTransactionStatus",
    body: {
      query: query,
    },
  });

  if (lookupData.hits && lookupData.hits?.hits?.length > 1) {
    source["saleTransaction.status"] = lookupData.hits.hits[0]?._source;
  }
};

module.exports = {
  getAllSaleTransactionCorrectionAuditView,
  getSaleTransactionCorrectionAuditView,
  saleTransactionAggregateDataFromIndex,
  changedByUserAggregateDataFromIndex,
  storeInfoAggregateDataFromIndex,
  sellerInfoAggregateDataFromIndex,
  changeTypeLabelLookupDataFromIndex,
  statusLabelLookupDataFromIndex,
};
