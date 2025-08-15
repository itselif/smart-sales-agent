const { elasticClient } = require("common/elasticsearch");

const auditLogViewAggregateData = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];

    const result = await elasticClient.search({
      index: "salesai1_auditLog",
      body: {
        query: { terms: { id: idList } },
        _source: [
          "id",
          "userId",
          "storeId",
          "actionType",
          "entityType",
          "entityId",
          "createdAt",
          "severity",
          "message",
        ],
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(userInfoAggregateDataFromIndex(source));

      promises.push(storeInfoAggregateDataFromIndex(source));

      promises.push(severityLabelLookupDataFromIndex(source));

      await Promise.all(promises);

      await elasticClient.index({
        index: "salesai1_auditlogview",
        id: source["id"],
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in auditLogAggregateData", error);
  }
};

const userInfoAggregateDataFromIndex = async (source) => {
  const aggregation = await elasticClient.search({
    index: "salesai1_user",
    body: {
      query: {
        match: {
          id: source["userId"],
        },
      },
      _source: ["id", "email", "fullName", "username"],
    },
  });

  if (aggregation.hits.hits.length > 0) {
    source["userInfo"] = aggregation.hits.hits[0]?._source;
  }
};

const userInfoReAuditLogView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "salesai1_auditlogview",
      body: {
        query: { terms: { "user.id": idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(userInfoAggregateDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "salesai1_auditlogview",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in userReAggregateauditLogView", error);
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
      _source: ["id", "name"],
    },
  });

  if (aggregation.hits.hits.length > 0) {
    source["storeInfo"] = aggregation.hits.hits[0]?._source;
  }
};

const storeInfoReAuditLogView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "salesai1_auditlogview",
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
        index: "salesai1_auditlogview",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in storeReAggregateauditLogView", error);
  }
};

const severityLabelLookupDataFromIndex = async (source) => {
  const query = {
    match: {
      id: source["severity"],
    },
  };

  const lookupData = await elasticClient.search({
    index: "salesai1_auditLogSeverity",
    body: {
      query: query,
    },
  });

  if (lookupData.hits && lookupData.hits?.hits?.length > 1) {
    source["severity"] = lookupData.hits.hits[0]?._source;
  }
};

const severityLabelReauditLogView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "salesai1_auditlogview",
      body: {
        query: { terms: { severity: idList } },
      },
    });

    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(severityLabelLookupDataFromIndex(source));

      await Promise.all(promises);
      await elasticClient.index({
        index: "salesai1_auditlogview",
        id: hit.id,
        body: source,
      });
    }
  } catch (error) {
    console.log("Error in severityLabelReauditLogView", error);
  }
};

module.exports = {
  auditLogViewAggregateData,

  userInfoReAuditLogView,
  storeInfoReAuditLogView,
  severityLabelReauditLogView,
  userInfoAggregateDataFromIndex,
  storeInfoAggregateDataFromIndex,
  severityLabelLookupDataFromIndex,
};
