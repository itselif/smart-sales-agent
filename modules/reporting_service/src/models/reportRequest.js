const { sequelize } = require("common");
const { DataTypes } = require("sequelize");

//Captures a user&#39;s request to generate a report, including all parameters such as report type, date range, store(s), and output format. Tracks status for audit and process management.
const ReportRequest = sequelize.define(
  "reportRequest",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    requestedByUserId: {
      // ID of the user who requests the report.
      type: DataTypes.UUID,
      allowNull: false,
    },
    reportType: {
      // Type of report requested: 0=dailySales, 1=inventory, 2=analytics, 3=crossStoreSummary, 4=userActionAudit
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "dailySales",
    },
    storeIds: {
      // IDs of stores covered by the report request (can be one or multiple, depending on permission).
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: false,
    },
    dateFrom: {
      // Report start date or single day for daily reports.
      type: DataTypes.DATE,
      allowNull: false,
    },
    dateTo: {
      // Report end date (can be same as dateFrom for one day reports).
      type: DataTypes.DATE,
      allowNull: false,
    },
    productIds: {
      // SKUs or IDs of products relevant to the report, optional.
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    format: {
      // Format for output file(s): 0=pdf, 1=csv, 2=xlsx
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pdf",
    },
    status: {
      // Status of the report request. 0=pending, 1=processing, 2=complete, 3=failed
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
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
        fields: ["requestedByUserId"],
      },
    ],
  },
);

module.exports = ReportRequest;
