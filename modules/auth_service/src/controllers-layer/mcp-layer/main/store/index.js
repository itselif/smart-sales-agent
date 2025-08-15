module.exports = (headers) => {
  // Store Db Object Rest Api Router
  const storeMcpRouter = [];
  // createStore controller
  storeMcpRouter.push(require("./create-store")(headers));
  // getStore controller
  storeMcpRouter.push(require("./get-store")(headers));
  // getStoreByCodename controller
  storeMcpRouter.push(require("./get-storebycodename")(headers));
  // listRegisteredStores controller
  storeMcpRouter.push(require("./list-registeredstores")(headers));
  return storeMcpRouter;
};
