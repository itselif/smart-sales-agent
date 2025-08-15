const express = require("express");

// Store Db Object Rest Api Router
const storeRouter = express.Router();

// add Store controllers

// getStore controller
storeRouter.get("/stores/:storeId", require("./get-store"));
// createStore controller
storeRouter.post("/stores", require("./create-store"));
// updateStore controller
storeRouter.patch("/stores/:storeId", require("./update-store"));
// deleteStore controller
storeRouter.delete("/stores/:storeId", require("./delete-store"));
// listStores controller
storeRouter.get("/stores", require("./list-stores"));

module.exports = storeRouter;
