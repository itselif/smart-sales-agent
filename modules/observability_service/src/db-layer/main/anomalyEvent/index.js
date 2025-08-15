const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  dbGetAnomalyevent: require("./dbGetAnomalyevent"),
  dbCreateAnomalyevent: require("./dbCreateAnomalyevent"),
  dbUpdateAnomalyevent: require("./dbUpdateAnomalyevent"),
  dbDeleteAnomalyevent: require("./dbDeleteAnomalyevent"),
  dbListAnomalyevents: require("./dbListAnomalyevents"),
  createAnomalyEvent: utils.createAnomalyEvent,
  getIdListOfAnomalyEventByField: utils.getIdListOfAnomalyEventByField,
  getAnomalyEventById: utils.getAnomalyEventById,
  getAnomalyEventAggById: utils.getAnomalyEventAggById,
  getAnomalyEventListByQuery: utils.getAnomalyEventListByQuery,
  getAnomalyEventStatsByQuery: utils.getAnomalyEventStatsByQuery,
  getAnomalyEventByQuery: utils.getAnomalyEventByQuery,
  updateAnomalyEventById: utils.updateAnomalyEventById,
  updateAnomalyEventByIdList: utils.updateAnomalyEventByIdList,
  updateAnomalyEventByQuery: utils.updateAnomalyEventByQuery,
  deleteAnomalyEventById: utils.deleteAnomalyEventById,
  deleteAnomalyEventByQuery: utils.deleteAnomalyEventByQuery,
};
