module.exports = (headers) => {
  // main Database Crud Object Mcp Api Routers
  return {
    saleTransactionMcpRouter: require("./saleTransaction")(headers),
    saleTransactionHistoryMcpRouter: require("./saleTransactionHistory")(
      headers,
    ),
  };
};
