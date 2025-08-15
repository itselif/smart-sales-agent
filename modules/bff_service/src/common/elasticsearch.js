const { Client } = require("@elastic/elasticsearch");
const elasticUri = process.env.ELASTIC_URI || "http://localhost:9200";
const elasticUser = process.env.ELASTIC_USER || "elastic";
const elasticPwd = process.env.ELASTIC_PWD || "zci+imLCfkbSC=RxLHjH";

const elasticClient = new Client({
  node: elasticUri,
  requestTimeout: 10000,
  auth: { username: elasticUser, password: elasticPwd },
  ssl: {
    ca: process.env.ELASTIC_CERT,
    rejectUnauthorized: false,
  },
});

const getAllIndices = async function () {
  return await elasticClient.cat.indices({ format: "json" });
};

const checkIndexExists = async function (indexName) {
  return await elasticClient.indices.exists({
    index: indexName,
  });
};

const createIndex = async function (indexName) {
  return await elasticClient.indices.create({
    index: indexName,
  });
};

const checkIndexMapping = async function (indexName) {
  return await elasticClient.indices.getMapping({
    index: indexName,
  });
};

const putMapping = async function (indexName, mapping) {
  return await elasticClient.indices.putMapping({
    index: indexName,
    body: mapping,
  });
};

const search = async function (indexName, searchQuery, page = 1, limit = 100) {
  return await elasticClient.search({
    index: indexName,
    body: searchQuery,
    from: (page - 1) * limit,
    size: limit,
  });
};

const multiSearch = async function (searchQuery, limit = 100) {
  return await elasticClient.search({
    body: searchQuery,
    size: limit,
  });
};

const count = async function (indexName, searchQuery) {
  return await elasticClient.count({
    index: indexName,
    body: searchQuery,
  });
};

const deleteIndex = async function (indexName) {
  return await elasticClient.indices.delete({
    index: indexName,
  });
};

const getDocumentById = async function (indexName, id) {
  return await elasticClient.get({
    index: indexName,
    id: id,
  });
};

const createDocument = async function (indexName, body, id) {
  return await elasticClient.index({
    index: indexName,
    body: body,
    id: id,
  });
};

const deleteDocument = async function (indexName, id) {
  return await elasticClient.delete({
    index: indexName,
    id: id,
  });
};

const updateDocument = async function (indexName, id, body) {
  return await elasticClient.update({
    index: indexName,
    id: id,
    body: body,
  });
};

const bulk = async function (indexName, body) {
  return await elasticClient.bulk({
    index: indexName,
    body: body,
  });
};

const queryBuilder = function (filters) {
  let query = {
    bool: {
      must: [],
      must_not: [],
      filter: [],
      should: [],
    },
  };

  Object.keys(filters).forEach((key) => {
    if (filters[key]) {
      const filter = filters[key];
      const operator = filter.operator.toLowerCase();
      const value = filter.value;

      switch (operator) {
        case "eq":
          query.bool.must.push({ match: { [key]: value } });
          break;
        case "noteq":
          query.bool.must_not.push({ match: { [key]: value } });
          break;
        case "range":
          if (filter.values && filter.values.length === 2) {
            query.bool.filter.push({
              range: {
                [key]: { gte: filter.values[0], lte: filter.values[1] },
              },
            });
          }
          break;
        case "exists":
          query.bool.filter.push({ exists: { field: key } });
          break;
        case "missing":
          query.bool.must_not.push({ exists: { field: key } });
          break;
        case "prefix":
          query.bool.filter.push({ prefix: { [key]: value } });
          break;
        case "wildcard":
          query.bool.filter.push({ wildcard: { [key]: `*${value}*` } });
          break;
        case "regexp":
          query.bool.filter.push({ regexp: { [key]: value } });
          break;
        case "match_phrase":
          query.bool.filter.push({ match_phrase: { [key]: value } });
          break;
        case "match_phrase_prefix":
          query.bool.filter.push({ match_phrase_prefix: { [key]: value } });
          break;
        default:
          // Geçersiz operatör
          console.error("Geçersiz operatör:", operator);
      }
    }
  });

  return query;
};

const aggBuilder = function (aggs) {
  let queryAggs = {};

  for (const key of aggs) {
    queryAggs[key] = {
      terms: {
        field: key,
        size: 10000,
      },
    };
  }
  return queryAggs;
};

const searchBuilder = function (query, text) {
  if (!text) return query;
  query.bool.should.push({
    multi_match: {
      query: text,
      fields: ["*"],
      type: "best_fields",
      operator: "AND",
    },
  });

  query.bool.should.push({
    match_phrase: {
      name: text,
    },
  });

  query.bool.should.push({
    match: {
      name: {
        query: text,
        fuzziness: "AUTO",
      },
    },
  });

  return query;
};

const negativeParams = ["page", "limit", "sortBy", "sortOrder", "q"];
const filterBuilder = function (query) {
  let filters = {};
  Object.keys(query).forEach((key) => {
    if (!negativeParams.includes(key)) {
      filters[key] = {
        operator: "eq",
        value: query[key],
      };
    }
  });

  return filters;
};

const sortAndFilterTypes = [
  "keyword",
  "date",
  "long",
  "integer",
  "short",
  "byte",
  "double",
  "float",
  "boolean",
  "ip",
  "geo-point",
];

const fieldBuilder = function (properties, parent = null) {
  if (!properties) {
    return [];
  }

  let fields = [];
  Object.keys(properties).forEach((key) => {
    const type = properties[key].type;
    if (sortAndFilterTypes.includes(type)) {
      fields.push(parent != null ? `${parent}.${key}` : key);
    }

    if (properties[key].properties) {
      fields.push(
        ...fieldBuilder(
          properties[key].properties,
          parent != null ? `${parent}.${key}` : key,
        ),
      );
    }
  });

  return fields;
};

const multiSearchBuilder = function (settings, text) {
  const shouldQueries = settings.map((item) => ({
    multi_match: {
      query: text,
      fields: item.fields,
      boost: item.boost,
    },
  }));

  const indices_boost = [];
  settings.forEach((item) => {
    indices_boost.push({
      [`${item.index}`]: item.boost,
    });
  });
  return {
    query: {
      bool: {
        should: shouldQueries,
      },
    },
    indices_boost: indices_boost,
  };
};

module.exports = {
  elasticClient,
  getAllIndices,
  search,
  multiSearch,
  count,
  putMapping,
  checkIndexExists,
  createIndex,
  deleteIndex,
  deleteDocument,
  updateDocument,
  bulk,
  createDocument,
  checkIndexMapping,
  queryBuilder,
  aggBuilder,
  searchBuilder,
  filterBuilder,
  getDocumentById,
  fieldBuilder,
  multiSearchBuilder,
};
