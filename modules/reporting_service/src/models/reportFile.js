const { sequelize } = require("common");
const { DataTypes } = require("sequelize");

//Represents a generated report file, its secure access URL, format, expiry, and download/audit metadata. Links to reportRequest for traceability.
const ReportFile = sequelize.define(
  "reportFile",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    reportRequestId: {
      // Reference to the reportRequest for which this file was generated.
      type: DataTypes.UUID,
      allowNull: false,
    },
    fileUrl: {
      // Storage URL (internal/public) of the report file.
      type: DataTypes.STRING,
      allowNull: false,
    },
    format: {
      // Report file format: 0=pdf, 1=csv, 2=xlsx
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pdf",
    },
    signedUrl: {
      // Time-limited, signed download URL for the file, generated per access policy.
      type: DataTypes.STRING,
      allowNull: true,
    },
    signedUrlExpiry: {
      // The expiration time for the signed download URL.
      type: DataTypes.DATE,
      allowNull: true,
    },
    downloadCount: {
      // How many times this report was downloaded (incremented for auditing).
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
        fields: ["reportRequestId"],
      },
    ],
  },
);

module.exports = ReportFile;
