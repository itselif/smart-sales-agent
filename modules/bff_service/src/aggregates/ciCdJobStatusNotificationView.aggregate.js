const { elasticClient } = require("common/elasticsearch");

const getAllCiCdJobStatusNotificationView = async (filter = null) => {
  try {
    const query = filter ? { match: filter } : { match_all: {} };
    const result = await elasticClient.search({
      index: "salesai1_openApiSchema",
      body: {
        query: query,
        _source: ["id", "version", "description", "createdAt", "updatedAt"],
      },
    });

    const response = [];
    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      await Promise.all(promises);
      response.push(source);
    }
    return response;
  } catch (error) {
    console.log("Error in openApiSchemaAggregateData", error);
  }
};

const getCiCdJobStatusNotificationView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "salesai1_openApiSchema",
      body: {
        query: { terms: { id: idList } },
        _source: ["id", "version", "description", "createdAt", "updatedAt"],
      },
    });

    const response = [];
    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      await Promise.all(promises);
      response.push(source);
    }
    return response;
  } catch (error) {
    console.log("Error in openApiSchemaAggregateData", error);
  }
};

module.exports = {
  getAllCiCdJobStatusNotificationView,
  getCiCdJobStatusNotificationView,
};
