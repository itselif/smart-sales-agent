const express = require("express");

// AnomalyEvent Db Object Rest Api Router
const anomalyEventRouter = express.Router();

// add AnomalyEvent controllers

// getAnomalyEvent controller
anomalyEventRouter.get(
  "/anomalyevents/:anomalyEventId",
  require("./get-anomalyevent"),
);
// createAnomalyEvent controller
anomalyEventRouter.post("/anomalyevents", require("./create-anomalyevent"));
// updateAnomalyEvent controller
anomalyEventRouter.patch(
  "/anomalyevents/:anomalyEventId",
  require("./update-anomalyevent"),
);
// deleteAnomalyEvent controller
anomalyEventRouter.delete(
  "/anomalyevents/:anomalyEventId",
  require("./delete-anomalyevent"),
);
// listAnomalyEvents controller
anomalyEventRouter.get("/anomalyevents", require("./list-anomalyevents"));

module.exports = anomalyEventRouter;
