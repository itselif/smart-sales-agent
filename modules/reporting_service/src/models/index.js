const { DataTypes } = require("sequelize");
const { getEnumValue } = require("serviceCommon");
const { ElasticIndexer } = require("serviceCommon");
const updateElasticIndexMappings = require("./elastic-index");
const { hexaLogger } = require("common");

const ReportRequest = require("./reportRequest");
const ReportFile = require("./reportFile");
const ReportPolicy = require("./reportPolicy");

ReportRequest.prototype.getData = function () {
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
  const reportTypeOptions = [
    "dailySales",
    "inventory",
    "analytics",
    "crossStoreSummary",
    "userActionAudit",
  ];
  const dataTypereportTypeReportRequest = typeof data.reportType;
  const enumIndexreportTypeReportRequest =
    dataTypereportTypeReportRequest === "string"
      ? reportTypeOptions.indexOf(data.reportType)
      : data.reportType;
  data.reportType_idx = enumIndexreportTypeReportRequest;
  data.reportType =
    enumIndexreportTypeReportRequest > -1
      ? reportTypeOptions[enumIndexreportTypeReportRequest]
      : undefined;
  // set enum Index and enum value
  const formatOptions = ["pdf", "csv", "xlsx"];
  const dataTypeformatReportRequest = typeof data.format;
  const enumIndexformatReportRequest =
    dataTypeformatReportRequest === "string"
      ? formatOptions.indexOf(data.format)
      : data.format;
  data.format_idx = enumIndexformatReportRequest;
  data.format =
    enumIndexformatReportRequest > -1
      ? formatOptions[enumIndexformatReportRequest]
      : undefined;
  // set enum Index and enum value
  const statusOptions = ["pending", "processing", "complete", "failed"];
  const dataTypestatusReportRequest = typeof data.status;
  const enumIndexstatusReportRequest =
    dataTypestatusReportRequest === "string"
      ? statusOptions.indexOf(data.status)
      : data.status;
  data.status_idx = enumIndexstatusReportRequest;
  data.status =
    enumIndexstatusReportRequest > -1
      ? statusOptions[enumIndexstatusReportRequest]
      : undefined;

  data._owner = data.requestedByUserId ?? undefined;
  return data;
};

ReportFile.prototype.getData = function () {
  const data = this.dataValues;

  data.reportRequest = this.reportRequest
    ? this.reportRequest.getData()
    : undefined;

  for (const key of Object.keys(data)) {
    if (key.startsWith("json_")) {
      data[key] = JSON.parse(data[key]);
      const newKey = key.slice(5);
      data[newKey] = data[key];
      delete data[key];
    }
  }

  // set enum Index and enum value
  const formatOptions = ["pdf", "csv", "xlsx"];
  const dataTypeformatReportFile = typeof data.format;
  const enumIndexformatReportFile =
    dataTypeformatReportFile === "string"
      ? formatOptions.indexOf(data.format)
      : data.format;
  data.format_idx = enumIndexformatReportFile;
  data.format =
    enumIndexformatReportFile > -1
      ? formatOptions[enumIndexformatReportFile]
      : undefined;

  return data;
};

ReportFile.belongsTo(ReportRequest, {
  as: "reportRequest",
  foreignKey: "reportRequestId",
  targetKey: "id",
  constraints: false,
});

ReportPolicy.prototype.getData = function () {
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
  const reportTypeOptions = [
    "dailySales",
    "inventory",
    "analytics",
    "crossStoreSummary",
    "userActionAudit",
  ];
  const dataTypereportTypeReportPolicy = typeof data.reportType;
  const enumIndexreportTypeReportPolicy =
    dataTypereportTypeReportPolicy === "string"
      ? reportTypeOptions.indexOf(data.reportType)
      : data.reportType;
  data.reportType_idx = enumIndexreportTypeReportPolicy;
  data.reportType =
    enumIndexreportTypeReportPolicy > -1
      ? reportTypeOptions[enumIndexreportTypeReportPolicy]
      : undefined;
  // set enum Index and enum value
  const allowedFormatsOptions = ["pdf", "csv", "xlsx"];
  const dataTypeallowedFormatsReportPolicy = typeof data.allowedFormats;
  const enumIndexallowedFormatsReportPolicy =
    dataTypeallowedFormatsReportPolicy === "string"
      ? allowedFormatsOptions.indexOf(data.allowedFormats)
      : data.allowedFormats;
  data.allowedFormats_idx = enumIndexallowedFormatsReportPolicy;
  data.allowedFormats =
    enumIndexallowedFormatsReportPolicy > -1
      ? allowedFormatsOptions[enumIndexallowedFormatsReportPolicy]
      : undefined;

  return data;
};

module.exports = {
  ReportRequest,
  ReportFile,
  ReportPolicy,
  updateElasticIndexMappings,
};
