const { sequelize } = require("common");
const { DataTypes } = require("sequelize");

//Stores current and historical OpenAPI schema definitions for all APIs, including versioning and description metadata.
const OpenApiSchema = sequelize.define(
  "openApiSchema",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    version: {
      // Schema version (e.g., 'v1.0.3').
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "v1",
    },
    description: {
      // Description/notes about this schema version.
      type: DataTypes.TEXT,
      allowNull: true,
    },
    schemaJson: {
      // Raw OpenAPI schema JSON (stringified).
      type: DataTypes.TEXT,
      allowNull: false,
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
        unique: true,
        fields: ["version"],
        where: { isActive: true },
      },
    ],
  },
);

module.exports = OpenApiSchema;
