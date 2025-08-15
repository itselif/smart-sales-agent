module.exports = (headers) => {
  // Store Db Object Rest Api Router
  const storeMcpRouter = [];
  // getStore controller
  storeMcpRouter.push(require("./get-store")(headers));
  // createStore controller
  storeMcpRouter.push(require("./create-store")(headers));
  // updateStore controller
  storeMcpRouter.push(require("./update-store")(headers));
  // deleteStore controller
  storeMcpRouter.push(require("./delete-store")(headers));
  // listStores controller
  storeMcpRouter.push(require("./list-stores")(headers));
  return storeMcpRouter;
};
