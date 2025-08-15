const { Client } = require("pg");
const { db } = require("../models");

let dbUser = process.env.PG_USER;
let dbPass = process.env.PG_PASSWORD;
let dbHost = process.env.PG_HOST;
let dbPort = process.env.PG_PORT ?? 5432;
let dbName = process.env.DB_NAME ?? process.env.SERVICE_CODENAME ?? "test";

/**
 * Initialize the database
 * if the database does not exist, create it
 */
const databaseInit = async () => {
  try {
    const client = new Client({
      user: dbUser,
      password: dbPass,
      host: dbHost,
      port: dbPort,
      database: "postgres",
    });
    await client.connect();

    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`,
    );

    if (res.rowCount === 0) {
      console.log(`Creating database ${dbName}`);
      await client.query(`CREATE DATABASE "${dbName}"`);
    }

    await client.end();

    // sync the models with the database
    await db.sequelize.sync({ force: false });
    console.log("Database initialized");
  } catch (error) {
    console.log(error);
  }
};

module.exports = databaseInit;
