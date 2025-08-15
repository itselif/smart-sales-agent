module.exports = (headers) => {
  // main Database Crud Object Mcp Api Routers
  return {
    userMcpRouter: require("./user")(headers),
    userGroupMcpRouter: require("./userGroup")(headers),
    userGroupMemberMcpRouter: require("./userGroupMember")(headers),
    storeMcpRouter: require("./store")(headers),
  };
};
