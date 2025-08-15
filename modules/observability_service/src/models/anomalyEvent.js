const { sequelize } = require("common");
const { DataTypes } = require("sequelize");

//Represents a detected or reported anomaly (e.g., suspicious, failed or policy-violating activity) for compliance/investigation. Tracks type, source, severity, and review status.
const AnomalyEvent = sequelize.define(
  "anomalyEvent",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    anomalyType: {
      // Type of anomaly (e.g., dataTamper, suspiciousEdit, fraud, systemFailure, policyBreach, invalidLogin, reportAbuse, etc.)
      type: DataTypes.STRING,
      allowNull: false,
    },
    triggeredByUserId: {
      // User who reported or triggered the anomaly, if any.
      type: DataTypes.UUID,
      allowNull: true,
    },
    affectedUserId: {
      // User affected by anomaly (if different from trigger).
      type: DataTypes.UUID,
      allowNull: true,
    },
    storeId: {
      // Store linked to the anomaly, if relevant.
      type: DataTypes.UUID,
      allowNull: true,
    },
    relatedEntityType: {
      // Type of related entity (metric, auditLog, saleTransaction, etc.), if anomaly links to another record.
      type: DataTypes.STRING,
      allowNull: true,
    },
    relatedEntityId: {
      // ID of related entity record.
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      // Description/details regarding the anomaly for compliance, notification, and investigation.
      type: DataTypes.TEXT,
      allowNull: true,
    },
    detectedAt: {
      // Date/time anomaly was detected/flagged.
      type: DataTypes.DATE,
      allowNull: false,
    },
    severity: {
      // Severity of anomaly: 0=low, 1=medium, 2=high, 3=critical.
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "medium",
    },
    status: {
      // Status of event: 0=open, 1=investigating, 2=resolved, 3=closed.
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "open",
    },
    reviewedByUserId: {
      // User who performed/closed/reviewed the anomaly (e.g., admin or investigator).
      type: DataTypes.UUID,
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
        fields: ["anomalyType"],
      },
      {
        unique: false,
        fields: ["detectedAt"],
      },
      {
        unique: false,
        fields: ["severity"],
      },
      {
        unique: false,
        fields: ["status"],
      },

      {
        unique: true,
        fields: ["anomalyType", "detectedAt", "status"],
        where: { isActive: true },
      },
    ],
  },
);

module.exports = AnomalyEvent;
