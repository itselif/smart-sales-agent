const { sequelize } = require("common");
const { DataTypes } = require("sequelize");

//Admin-configurable reporting policy and metadata. Specifies allowed report types, retention, and generation params.
const ReportPolicy = sequelize.define(
  "reportPolicy",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    reportType: {
      // Which type of report this policy applies to: 0=dailySales, 1=inventory, 2=analytics, 3=crossStoreSummary, 4=userActionAudit
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "dailySales",
    },
    maxRetentionDays: {
      // Maximum retention of report files (in days).
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
    },
    allowedFormats: {
      // Which file formats are allowed for this report type. (Enum: 0=pdf, 1=csv, 2=xlsx)
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: "pdf",
    },
    description: {
      // Policy description, admin notes, or compliance notes.
      type: DataTypes.TEXT,
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
        fields: ["reportType"],
      },
    ],
  },
);

module.exports = ReportPolicy;
