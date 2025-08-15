module.exports = (headers) => {
  // AnomalyEvent Db Object Rest Api Router
  const anomalyEventMcpRouter = [];
  // getAnomalyEvent controller
  anomalyEventMcpRouter.push(require("./get-anomalyevent")(headers));
  // createAnomalyEvent controller
  anomalyEventMcpRouter.push(require("./create-anomalyevent")(headers));
  // updateAnomalyEvent controller
  anomalyEventMcpRouter.push(require("./update-anomalyevent")(headers));
  // deleteAnomalyEvent controller
  anomalyEventMcpRouter.push(require("./delete-anomalyevent")(headers));
  // listAnomalyEvents controller
  anomalyEventMcpRouter.push(require("./list-anomalyevents")(headers));
  return anomalyEventMcpRouter;
};
