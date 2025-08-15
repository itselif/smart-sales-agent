module.exports = {
  ObservabilityServiceManager: require("./service-manager/ObservabilityServiceManager"),
  // main Database Crud Object Routes Manager Layer Classes
  // AuditLog Db Object
  GetAuditLogManager: require("./main/auditLog/get-auditlog"),
  CreateAuditLogManager: require("./main/auditLog/create-auditlog"),
  UpdateAuditLogManager: require("./main/auditLog/update-auditlog"),
  DeleteAuditLogManager: require("./main/auditLog/delete-auditlog"),
  ListAuditLogsManager: require("./main/auditLog/list-auditlogs"),
  // MetricDatapoint Db Object
  GetMetricDatapointManager: require("./main/metricDatapoint/get-metricdatapoint"),
  CreateMetricDatapointManager: require("./main/metricDatapoint/create-metricdatapoint"),
  UpdateMetricDatapointManager: require("./main/metricDatapoint/update-metricdatapoint"),
  DeleteMetricDatapointManager: require("./main/metricDatapoint/delete-metricdatapoint"),
  ListMetricDatapointsManager: require("./main/metricDatapoint/list-metricdatapoints"),
  // AnomalyEvent Db Object
  GetAnomalyEventManager: require("./main/anomalyEvent/get-anomalyevent"),
  CreateAnomalyEventManager: require("./main/anomalyEvent/create-anomalyevent"),
  UpdateAnomalyEventManager: require("./main/anomalyEvent/update-anomalyevent"),
  DeleteAnomalyEventManager: require("./main/anomalyEvent/delete-anomalyevent"),
  ListAnomalyEventsManager: require("./main/anomalyEvent/list-anomalyevents"),
};
