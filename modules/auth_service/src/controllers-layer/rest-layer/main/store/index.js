const express = require("express");

// Store Db Object Rest Api Router
const storeRouter = express.Router();

// add Store controllers

// createStore controller
storeRouter.post("/stores", require("./create-store"));
// getStore controller
storeRouter.get("/stores/:storeId", require("./get-store"));
// getStoreByCodename controller
storeRouter.get("/storebycodename/:codename", require("./get-storebycodename"));
// listRegisteredStores controller
storeRouter.get("/registeredstores", require("./list-registeredstores"));

module.exports = storeRouter;
