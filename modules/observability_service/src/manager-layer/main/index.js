module.exports = {
  // main Database Crud Object Routes Manager Layer Classes
  // AuditLog Db Object
  GetAuditLogManager: require("./auditLog/get-auditlog"),
  CreateAuditLogManager: require("./auditLog/create-auditlog"),
  UpdateAuditLogManager: require("./auditLog/update-auditlog"),
  DeleteAuditLogManager: require("./auditLog/delete-auditlog"),
  ListAuditLogsManager: require("./auditLog/list-auditlogs"),
  // MetricDatapoint Db Object
  GetMetricDatapointManager: require("./metricDatapoint/get-metricdatapoint"),
  CreateMetricDatapointManager: require("./metricDatapoint/create-metricdatapoint"),
  UpdateMetricDatapointManager: require("./metricDatapoint/update-metricdatapoint"),
  DeleteMetricDatapointManager: require("./metricDatapoint/delete-metricdatapoint"),
  ListMetricDatapointsManager: require("./metricDatapoint/list-metricdatapoints"),
  // AnomalyEvent Db Object
  GetAnomalyEventManager: require("./anomalyEvent/get-anomalyevent"),
  CreateAnomalyEventManager: require("./anomalyEvent/create-anomalyevent"),
  UpdateAnomalyEventManager: require("./anomalyEvent/update-anomalyevent"),
  DeleteAnomalyEventManager: require("./anomalyEvent/delete-anomalyevent"),
  ListAnomalyEventsManager: require("./anomalyEvent/list-anomalyevents"),
};
