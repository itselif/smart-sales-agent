const { DataTypes } = require("sequelize");
const { getEnumValue } = require("serviceCommon");
const { ElasticIndexer } = require("serviceCommon");
const updateElasticIndexMappings = require("./elastic-index");
const { hexaLogger } = require("common");

const AuditLog = require("./auditLog");
const MetricDatapoint = require("./metricDatapoint");
const AnomalyEvent = require("./anomalyEvent");

AuditLog.prototype.getData = function () {
  const data = this.dataValues;

  for (const key of Object.keys(data)) {
    if (key.startsWith("json_")) {
      data[key] = JSON.parse(data[key]);
      const newKey = key.slice(5);
      data[newKey] = data[key];
      delete data[key];
    }
  }

  // set enum Index and enum value
  const severityOptions = ["info", "warning", "critical"];
  const dataTypeseverityAuditLog = typeof data.severity;
  const enumIndexseverityAuditLog =
    dataTypeseverityAuditLog === "string"
      ? severityOptions.indexOf(data.severity)
      : data.severity;
  data.severity_idx = enumIndexseverityAuditLog;
  data.severity =
    enumIndexseverityAuditLog > -1
      ? severityOptions[enumIndexseverityAuditLog]
      : undefined;

  return data;
};

MetricDatapoint.prototype.getData = function () {
  const data = this.dataValues;

  for (const key of Object.keys(data)) {
    if (key.startsWith("json_")) {
      data[key] = JSON.parse(data[key]);
      const newKey = key.slice(5);
      data[newKey] = data[key];
      delete data[key];
    }
  }

  return data;
};

AnomalyEvent.prototype.getData = function () {
  const data = this.dataValues;

  for (const key of Object.keys(data)) {
    if (key.startsWith("json_")) {
      data[key] = JSON.parse(data[key]);
      const newKey = key.slice(5);
      data[newKey] = data[key];
      delete data[key];
    }
  }

  // set enum Index and enum value
  const severityOptions = ["low", "medium", "high", "critical"];
  const dataTypeseverityAnomalyEvent = typeof data.severity;
  const enumIndexseverityAnomalyEvent =
    dataTypeseverityAnomalyEvent === "string"
      ? severityOptions.indexOf(data.severity)
      : data.severity;
  data.severity_idx = enumIndexseverityAnomalyEvent;
  data.severity =
    enumIndexseverityAnomalyEvent > -1
      ? severityOptions[enumIndexseverityAnomalyEvent]
      : undefined;
  // set enum Index and enum value
  const statusOptions = ["open", "investigating", "resolved", "closed"];
  const dataTypestatusAnomalyEvent = typeof data.status;
  const enumIndexstatusAnomalyEvent =
    dataTypestatusAnomalyEvent === "string"
      ? statusOptions.indexOf(data.status)
      : data.status;
  data.status_idx = enumIndexstatusAnomalyEvent;
  data.status =
    enumIndexstatusAnomalyEvent > -1
      ? statusOptions[enumIndexstatusAnomalyEvent]
      : undefined;

  return data;
};

module.exports = {
  AuditLog,
  MetricDatapoint,
  AnomalyEvent,
  updateElasticIndexMappings,
};
