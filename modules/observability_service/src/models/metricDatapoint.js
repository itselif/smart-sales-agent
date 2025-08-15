const { sequelize } = require("common");
const { DataTypes } = require("sequelize");

//Stores a single time-series business/system/platform metric (e.g., salesCount, errorRate, latency), with target entity, granularity, observed value, and anomaly flags.
const MetricDatapoint = sequelize.define(
  "metricDatapoint",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    metricType: {
      // Type of metric (e.g., salesCount, inventoryLow, systemLatency, apiError, healthCheck, loginCount)
      type: DataTypes.STRING,
      allowNull: false,
    },
    targetType: {
      // Type of target: system, service, store, user, etc.
      type: DataTypes.STRING,
      allowNull: false,
    },
    targetId: {
      // ID of the target (storeId, service name, userId, etc.) as appropriate.
      type: DataTypes.STRING,
      allowNull: true,
    },
    periodStart: {
      // Start timestamp for the metric period (e.g. day, hour, minute, etc.).
      type: DataTypes.DATE,
      allowNull: false,
    },
    granularity: {
      // Granularity/resolution of the datapoint (minute/hour/day/etc).
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "minute",
    },
    value: {
      // Value of the metric datapoint.
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
    flagAnomalous: {
      // Indicates the datapoint is an anomaly (detected or flagged).
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    observedByUserId: {
      // User who reported/flagged/created this metric data, if manually added or updated (optional).
      type: DataTypes.UUID,
      allowNull: true,
    },
    context: {
      // Free-form context for the metric (cause, dimension, tags, error codes, etc.)
      type: DataTypes.JSONB,
      allowNull: true,
    },
    isActive: {
      // isActive property will be set to false when deleted
      // so that the document will be archived
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: true,
    },
  },
  {
    indexes: [
      {
        unique: false,
        fields: ["metricType"],
      },
      {
        unique: false,
        fields: ["targetType"],
      },
      {
        unique: false,
        fields: ["targetId"],
      },
      {
        unique: false,
        fields: ["periodStart"],
      },

      {
        unique: true,
        fields: ["metricType", "targetType", "targetId", "periodStart"],
        where: { isActive: true },
      },
    ],
  },
);

module.exports = MetricDatapoint;
