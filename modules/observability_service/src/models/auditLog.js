const { sequelize } = require("common");
const { DataTypes } = require("sequelize");

//Tracks every sensitive or critical action on the platform for audit/compliance. Includes what happened, who, when, entity, before/after data, store and user context, and extra trace fields.
const AuditLog = sequelize.define(
  "auditLog",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    userId: {
      // User who triggered the event/action being logged.
      type: DataTypes.UUID,
      allowNull: false,
    },
    actionType: {
      // Categorical action descriptor (e.g., saleEdit, overrideGrant, reportDownload, adminOp, login, healthCheck, seedInject, repoSwitch, etc.).
      type: DataTypes.STRING,
      allowNull: false,
    },
    entityType: {
      // Type of primary entity affected (e.g., saleTransaction, inventoryItem, reportFile, storeAssignment, seedData, metric, etc.).
      type: DataTypes.STRING,
      allowNull: true,
    },
    entityId: {
      // ID of the primary entity affected.
      type: DataTypes.STRING,
      allowNull: true,
    },
    beforeData: {
      // Snapshot of relevant data before the action/change. (deep copy/structure as needed).
      type: DataTypes.JSONB,
      allowNull: true,
    },
    afterData: {
      // Snapshot of data as it was after this action/change, if applicable.
      type: DataTypes.JSONB,
      allowNull: true,
    },
    severity: {
      // Severity/level of action event: 0=info, 1=warning, 2=critical.
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "info",
    },
    message: {
      // Human-readable text or trace providing context/description of the action.
      type: DataTypes.TEXT,
      allowNull: true,
    },
    traceContext: {
      // Flexible object: request IDs, IPs, client/user-agent, trace IDs, or extra structured context for compliance and troubleshooting.
      type: DataTypes.JSONB,
      allowNull: true,
    },
    storeId: {
      // An ID value to represent the tenant id of the store
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: "00000000-0000-0000-0000-000000000000",
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
        fields: ["userId"],
      },
      {
        unique: false,
        fields: ["actionType"],
      },
      {
        unique: false,
        fields: ["entityType"],
      },
      {
        unique: false,
        fields: ["severity"],
      },
      {
        unique: false,
        fields: ["storeId"],
      },

      {
        unique: true,
        fields: ["storeId", "userId", "createdAt"],
        where: { isActive: true },
      },
      {
        unique: true,
        fields: ["entityType", "entityId"],
        where: { isActive: true },
      },
    ],
  },
);

module.exports = AuditLog;
