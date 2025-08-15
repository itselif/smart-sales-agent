const auditLogFunctions = require("./auditLog");
const metricDatapointFunctions = require("./metricDatapoint");
const anomalyEventFunctions = require("./anomalyEvent");

module.exports = {
  // main Database
  // AuditLog Db Object
  dbGetAuditlog: auditLogFunctions.dbGetAuditlog,
  dbCreateAuditlog: auditLogFunctions.dbCreateAuditlog,
  dbUpdateAuditlog: auditLogFunctions.dbUpdateAuditlog,
  dbDeleteAuditlog: auditLogFunctions.dbDeleteAuditlog,
  dbListAuditlogs: auditLogFunctions.dbListAuditlogs,
  createAuditLog: auditLogFunctions.createAuditLog,
  getIdListOfAuditLogByField: auditLogFunctions.getIdListOfAuditLogByField,
  getAuditLogById: auditLogFunctions.getAuditLogById,
  getAuditLogAggById: auditLogFunctions.getAuditLogAggById,
  getAuditLogListByQuery: auditLogFunctions.getAuditLogListByQuery,
  getAuditLogStatsByQuery: auditLogFunctions.getAuditLogStatsByQuery,
  getAuditLogByQuery: auditLogFunctions.getAuditLogByQuery,
  updateAuditLogById: auditLogFunctions.updateAuditLogById,
  updateAuditLogByIdList: auditLogFunctions.updateAuditLogByIdList,
  updateAuditLogByQuery: auditLogFunctions.updateAuditLogByQuery,
  deleteAuditLogById: auditLogFunctions.deleteAuditLogById,
  deleteAuditLogByQuery: auditLogFunctions.deleteAuditLogByQuery,
  getAuditLogByStoreId: auditLogFunctions.getAuditLogByStoreId,

  // MetricDatapoint Db Object
  dbGetMetricdatapoint: metricDatapointFunctions.dbGetMetricdatapoint,
  dbCreateMetricdatapoint: metricDatapointFunctions.dbCreateMetricdatapoint,
  dbUpdateMetricdatapoint: metricDatapointFunctions.dbUpdateMetricdatapoint,
  dbDeleteMetricdatapoint: metricDatapointFunctions.dbDeleteMetricdatapoint,
  dbListMetricdatapoints: metricDatapointFunctions.dbListMetricdatapoints,
  createMetricDatapoint: metricDatapointFunctions.createMetricDatapoint,
  getIdListOfMetricDatapointByField:
    metricDatapointFunctions.getIdListOfMetricDatapointByField,
  getMetricDatapointById: metricDatapointFunctions.getMetricDatapointById,
  getMetricDatapointAggById: metricDatapointFunctions.getMetricDatapointAggById,
  getMetricDatapointListByQuery:
    metricDatapointFunctions.getMetricDatapointListByQuery,
  getMetricDatapointStatsByQuery:
    metricDatapointFunctions.getMetricDatapointStatsByQuery,
  getMetricDatapointByQuery: metricDatapointFunctions.getMetricDatapointByQuery,
  updateMetricDatapointById: metricDatapointFunctions.updateMetricDatapointById,
  updateMetricDatapointByIdList:
    metricDatapointFunctions.updateMetricDatapointByIdList,
  updateMetricDatapointByQuery:
    metricDatapointFunctions.updateMetricDatapointByQuery,
  deleteMetricDatapointById: metricDatapointFunctions.deleteMetricDatapointById,
  deleteMetricDatapointByQuery:
    metricDatapointFunctions.deleteMetricDatapointByQuery,

  // AnomalyEvent Db Object
  dbGetAnomalyevent: anomalyEventFunctions.dbGetAnomalyevent,
  dbCreateAnomalyevent: anomalyEventFunctions.dbCreateAnomalyevent,
  dbUpdateAnomalyevent: anomalyEventFunctions.dbUpdateAnomalyevent,
  dbDeleteAnomalyevent: anomalyEventFunctions.dbDeleteAnomalyevent,
  dbListAnomalyevents: anomalyEventFunctions.dbListAnomalyevents,
  createAnomalyEvent: anomalyEventFunctions.createAnomalyEvent,
  getIdListOfAnomalyEventByField:
    anomalyEventFunctions.getIdListOfAnomalyEventByField,
  getAnomalyEventById: anomalyEventFunctions.getAnomalyEventById,
  getAnomalyEventAggById: anomalyEventFunctions.getAnomalyEventAggById,
  getAnomalyEventListByQuery: anomalyEventFunctions.getAnomalyEventListByQuery,
  getAnomalyEventStatsByQuery:
    anomalyEventFunctions.getAnomalyEventStatsByQuery,
  getAnomalyEventByQuery: anomalyEventFunctions.getAnomalyEventByQuery,
  updateAnomalyEventById: anomalyEventFunctions.updateAnomalyEventById,
  updateAnomalyEventByIdList: anomalyEventFunctions.updateAnomalyEventByIdList,
  updateAnomalyEventByQuery: anomalyEventFunctions.updateAnomalyEventByQuery,
  deleteAnomalyEventById: anomalyEventFunctions.deleteAnomalyEventById,
  deleteAnomalyEventByQuery: anomalyEventFunctions.deleteAnomalyEventByQuery,
};
