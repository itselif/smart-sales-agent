const { elasticClient } = require("common/elasticsearch");

const getAllAccountRegistrationConfirmationView = async (filter = null) => {
  try {
    const query = filter ? { match: filter } : { match_all: {} };
    const result = await elasticClient.search({
      index: "salesai1_storeAssignment",
      body: {
        query: query,
        _source: ["userId", "role", "storeId"],
      },
    });

    const response = [];
    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(userInfoAggregateDataFromIndex(source));

      promises.push(storeInfoAggregateDataFromIndex(source));

      promises.push(roleLabelLookupDataFromIndex(source));

      await Promise.all(promises);
      response.push(source);
    }
    return response;
  } catch (error) {
    console.log("Error in storeAssignmentAggregateData", error);
  }
};

const getAccountRegistrationConfirmationView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "salesai1_storeAssignment",
      body: {
        query: { terms: { id: idList } },
        _source: ["userId", "role", "storeId"],
      },
    });

    const response = [];
    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(userInfoAggregateDataFromIndex(source));

      promises.push(storeInfoAggregateDataFromIndex(source));

      promises.push(roleLabelLookupDataFromIndex(source));

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
      _source: ["username", "fullname", "email"],
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
      _source: ["name"],
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
    index: "salesai1_storeRole",
    body: {
      query: query,
    },
  });

  if (lookupData.hits && lookupData.hits?.hits?.length > 1) {
    source["role"] = lookupData.hits.hits[0]?._source;
  }
};

module.exports = {
  getAllAccountRegistrationConfirmationView,
  getAccountRegistrationConfirmationView,
  userInfoAggregateDataFromIndex,
  storeInfoAggregateDataFromIndex,
  roleLabelLookupDataFromIndex,
};
