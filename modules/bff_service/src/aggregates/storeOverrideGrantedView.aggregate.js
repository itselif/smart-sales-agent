const { elasticClient } = require("common/elasticsearch");

const getAllStoreOverrideGrantedView = async (filter = null) => {
  try {
    const query = filter ? { match: filter } : { match_all: {} };
    const result = await elasticClient.search({
      index: "salesai1_storeAssignment",
      body: {
        query: query,
        _source: [
          "id",
          "userId",
          "storeId",
          "role",
          "assignmentType",
          "status",
          "overrideJustification",
          "validFrom",
          "validUntil",
        ],
      },
    });

    const response = [];
    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(userInfoAggregateDataFromIndex(source));

      promises.push(storeInfoAggregateDataFromIndex(source));

      promises.push(roleLabelLookupDataFromIndex(source));

      promises.push(assignmentTypeLabelLookupDataFromIndex(source));

      promises.push(statusLabelLookupDataFromIndex(source));

      await Promise.all(promises);
      response.push(source);
    }
    return response;
  } catch (error) {
    console.log("Error in storeAssignmentAggregateData", error);
  }
};

const getStoreOverrideGrantedView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "salesai1_storeAssignment",
      body: {
        query: { terms: { id: idList } },
        _source: [
          "id",
          "userId",
          "storeId",
          "role",
          "assignmentType",
          "status",
          "overrideJustification",
          "validFrom",
          "validUntil",
        ],
      },
    });

    const response = [];
    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(userInfoAggregateDataFromIndex(source));

      promises.push(storeInfoAggregateDataFromIndex(source));

      promises.push(roleLabelLookupDataFromIndex(source));

      promises.push(assignmentTypeLabelLookupDataFromIndex(source));

      promises.push(statusLabelLookupDataFromIndex(source));

      await Promise.all(promises);
      response.push(source);
    }
    return response;
  } catch (error) {
    console.log("Error in storeAssignmentAggregateData", error);
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

const roleLabelLookupDataFromIndex = async (source) => {
  const query = {
    match: {
      id: source["role"],
    },
  };

  const lookupData = await elasticClient.search({
    index: "salesai1_userRole",
    body: {
      query: query,
    },
  });

  if (lookupData.hits && lookupData.hits?.hits?.length > 1) {
    source["role"] = lookupData.hits.hits[0]?._source;
  }
};

const assignmentTypeLabelLookupDataFromIndex = async (source) => {
  const query = {
    match: {
      id: source["assignmentType"],
    },
  };

  const lookupData = await elasticClient.search({
    index: "salesai1_assignmentType",
    body: {
      query: query,
    },
  });

  if (lookupData.hits && lookupData.hits?.hits?.length > 1) {
    source["assignmentType"] = lookupData.hits.hits[0]?._source;
  }
};

const statusLabelLookupDataFromIndex = async (source) => {
  const query = {
    match: {
      id: source["status"],
    },
  };

  const lookupData = await elasticClient.search({
    index: "salesai1_assignmentStatus",
    body: {
      query: query,
    },
  });

  if (lookupData.hits && lookupData.hits?.hits?.length > 1) {
    source["status"] = lookupData.hits.hits[0]?._source;
  }
};

module.exports = {
  getAllStoreOverrideGrantedView,
  getStoreOverrideGrantedView,
  userInfoAggregateDataFromIndex,
  storeInfoAggregateDataFromIndex,
  roleLabelLookupDataFromIndex,
  assignmentTypeLabelLookupDataFromIndex,
  statusLabelLookupDataFromIndex,
};
