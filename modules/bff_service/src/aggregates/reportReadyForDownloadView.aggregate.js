const { elasticClient } = require("common/elasticsearch");

const getAllReportReadyForDownloadView = async (filter = null) => {
  try {
    const query = filter ? { match: filter } : { match_all: {} };
    const result = await elasticClient.search({
      index: "salesai1_reportFile",
      body: {
        query: query,
        _source: [
          "id",
          "signedUrl",
          "signedUrlExpiry",
          "format",
          "downloadCount",
          "reportRequestId",
        ],
      },
    });

    const response = [];
    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(reportRequestAggregateDataFromIndex(source));

      promises.push(requestingUserAggregateDataFromIndex(source));

      promises.push(reportTypeLabelLookupDataFromIndex(source));

      promises.push(statusLabelLookupDataFromIndex(source));

      await Promise.all(promises);
      response.push(source);
    }
    return response;
  } catch (error) {
    console.log("Error in reportFileAggregateData", error);
  }
};

const getReportReadyForDownloadView = async (id) => {
  try {
    const idList = Array.isArray(id) ? id : [id];
    const result = await elasticClient.search({
      index: "salesai1_reportFile",
      body: {
        query: { terms: { id: idList } },
        _source: [
          "id",
          "signedUrl",
          "signedUrlExpiry",
          "format",
          "downloadCount",
          "reportRequestId",
        ],
      },
    });

    const response = [];
    for (const hit of result?.hits?.hits) {
      let source = hit._source;
      let promises = [];

      promises.push(reportRequestAggregateDataFromIndex(source));

      promises.push(requestingUserAggregateDataFromIndex(source));

      promises.push(reportTypeLabelLookupDataFromIndex(source));

      promises.push(statusLabelLookupDataFromIndex(source));

      await Promise.all(promises);
      response.push(source);
    }
    return response;
  } catch (error) {
    console.log("Error in reportFileAggregateData", error);
  }
};

const reportRequestAggregateDataFromIndex = async (source) => {
  const aggregation = await elasticClient.search({
    index: "salesai1_reportRequest",
    body: {
      query: {
        match: {
          id: source["reportRequestId"],
        },
      },
      _source: [
        "id",
        "requestedByUserId",
        "reportType",
        "storeIds",
        "dateFrom",
        "dateTo",
        "status",
        "format",
      ],
    },
  });

  if (aggregation.hits.hits.length > 0) {
    source["reportRequest"] = aggregation.hits.hits[0]?._source;
  }
};

const requestingUserAggregateDataFromIndex = async (source) => {
  const aggregation = await elasticClient.search({
    index: "salesai1_user",
    body: {
      query: {
        match: {
          id: source["reportRequest"],
        },
      },
      _source: ["id", "email", "fullName", "username"],
    },
  });

  if (aggregation.hits.hits.length > 0) {
    source["requestingUser"] = aggregation.hits.hits[0]?._source;
  }
};

const reportTypeLabelLookupDataFromIndex = async (source) => {
  const query = {
    match: {
      id: source["reportRequest.reportType"],
    },
  };

  const lookupData = await elasticClient.search({
    index: "salesai1_reportType",
    body: {
      query: query,
    },
  });

  if (lookupData.hits && lookupData.hits?.hits?.length > 1) {
    source["reportRequest.reportType"] = lookupData.hits.hits[0]?._source;
  }
};

const statusLabelLookupDataFromIndex = async (source) => {
  const query = {
    match: {
      id: source["reportRequest.status"],
    },
  };

  const lookupData = await elasticClient.search({
    index: "salesai1_reportStatus",
    body: {
      query: query,
    },
  });

  if (lookupData.hits && lookupData.hits?.hits?.length > 1) {
    source["reportRequest.status"] = lookupData.hits.hits[0]?._source;
  }
};

module.exports = {
  getAllReportReadyForDownloadView,
  getReportReadyForDownloadView,
  reportRequestAggregateDataFromIndex,
  requestingUserAggregateDataFromIndex,
  reportTypeLabelLookupDataFromIndex,
  statusLabelLookupDataFromIndex,
};
