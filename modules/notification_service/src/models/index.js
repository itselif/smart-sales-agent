const db = {};

const Sequelize = require("sequelize");
const dbUser = process.env.PG_USER;
const dbPass = process.env.PG_PASSWORD;
const dbHost = process.env.PG_HOST;
const dbPort = process.env.PG_PORT ?? 5432;
const dbName = process.env.DB_NAME ?? process.env.SERVICE_CODENAME ?? "test";

const sequelize = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  port: dbPort,
  dialect: "postgres",
  logging: false,
  pool: {
    max: 9,
    min: 0,
    idle: 10000,
  },
});

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.notification = require("./notification.model.js")(sequelize, Sequelize);
db.deviceToken = require("./device.token.model.js")(sequelize, Sequelize);

Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

module.exports = { db };
