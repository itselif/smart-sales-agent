const { elasticClient } = require("common/elasticsearch");

const getAllSystemHealthIncidentView = async (filter = null) => {
  try {
    const query = filter ? { match: filter } : { match_all: {} };
    const result = await elasticClient.search({
      index: "salesai1_anomalyEvent",
      body: {
        query: query,
        _source: [
          "id",
          "anomalyType",
          "storeId",
          "detectedAt",
          "severity",
          "status",
          "description",
          "reviewedByUserId",
        ],
      },
    });

    const response = [];
    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(affectedStoreAggregateDataFromIndex(source));

      promises.push(triggeredByUserAggregateDataFromIndex(source));

      promises.push(reviewedByUserAggregateDataFromIndex(source));

      promises.push(severityLabelLookupDataFromIndex(source));

      promises.push(anomalyTypeLabelLookupDataFromIndex(source));

      promises.push(statusLabelLookupDataFromIndex(source));

      await Promise.all(promises);
      response.push(source);
    }
    return response;
  } catch (error) {
    console.log("Error in anomalyEventAggregateData", error);
  }
};

const getSystemHealthIncidentView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "salesai1_anomalyEvent",
      body: {
        query: { terms: { id: idList } },
        _source: [
          "id",
          "anomalyType",
          "storeId",
          "detectedAt",
          "severity",
          "status",
          "description",
          "reviewedByUserId",
        ],
      },
    });

    const response = [];
    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(affectedStoreAggregateDataFromIndex(source));

      promises.push(triggeredByUserAggregateDataFromIndex(source));

      promises.push(reviewedByUserAggregateDataFromIndex(source));

      promises.push(severityLabelLookupDataFromIndex(source));

      promises.push(anomalyTypeLabelLookupDataFromIndex(source));

      promises.push(statusLabelLookupDataFromIndex(source));

      await Promise.all(promises);
      response.push(source);
    }
    return response;
  } catch (error) {
    console.log("Error in anomalyEventAggregateData", error);
  }
};

const affectedStoreAggregateDataFromIndex = async (source) => {
  const aggregation = await elasticClient.search({
    index: "salesai1_store",
    body: {
      query: {
        match: {
          id: source["storeId"],
        },
      },
      _source: ["id", "name", "city"],
    },
  });

  if (aggregation.hits.hits.length > 0) {
    source["affectedStore"] = aggregation.hits.hits[0]?._source;
  }
};

const triggeredByUserAggregateDataFromIndex = async (source) => {
  const aggregation = await elasticClient.search({
    index: "salesai1_user",
    body: {
      query: {
        match: {
          id: source["triggeredByUserId"],
        },
      },
      _source: ["id", "fullName", "email"],
    },
  });

  if (aggregation.hits.hits.length > 0) {
    source["triggeredByUser"] = aggregation.hits.hits[0]?._source;
  }
};

const reviewedByUserAggregateDataFromIndex = async (source) => {
  const aggregation = await elasticClient.search({
    index: "salesai1_user",
    body: {
      query: {
        match: {
          id: source["reviewedByUserId"],
        },
      },
      _source: ["id", "fullName", "email"],
    },
  });

  if (aggregation.hits.hits.length > 0) {
    source["reviewedByUser"] = aggregation.hits.hits[0]?._source;
  }
};

const severityLabelLookupDataFromIndex = async (source) => {
  const query = {
    match: {
      id: source["severity"],
    },
  };

  const lookupData = await elasticClient.search({
    index: "salesai1_anomalySeverity",
    body: {
      query: query,
    },
  });

  if (lookupData.hits && lookupData.hits?.hits?.length > 1) {
    source["severity"] = lookupData.hits.hits[0]?._source;
  }
};

const anomalyTypeLabelLookupDataFromIndex = async (source) => {
  const query = {
    match: {
      id: source["anomalyType"],
    },
  };

  const lookupData = await elasticClient.search({
    index: "salesai1_anomalyType",
    body: {
      query: query,
    },
  });

  if (lookupData.hits && lookupData.hits?.hits?.length > 1) {
    source["anomalyType"] = lookupData.hits.hits[0]?._source;
  }
};

const statusLabelLookupDataFromIndex = async (source) => {
  const query = {
    match: {
      id: source["status"],
    },
  };

  const lookupData = await elasticClient.search({
    index: "salesai1_anomalyStatus",
    body: {
      query: query,
    },
  });

  if (lookupData.hits && lookupData.hits?.hits?.length > 1) {
    source["status"] = lookupData.hits.hits[0]?._source;
  }
};

module.exports = {
  getAllSystemHealthIncidentView,
  getSystemHealthIncidentView,
  affectedStoreAggregateDataFromIndex,
  triggeredByUserAggregateDataFromIndex,
  reviewedByUserAggregateDataFromIndex,
  severityLabelLookupDataFromIndex,
  anomalyTypeLabelLookupDataFromIndex,
  statusLabelLookupDataFromIndex,
};
