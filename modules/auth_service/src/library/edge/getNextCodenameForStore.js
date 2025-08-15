module.exports = async (request) => {
  const { getNextCodenameForStore } = require("dbLayer");
  const name = request.query?.name ?? null;
  if (!name) return { status: 400, message: "Name is required" };
  const result = await getNextCodenameForStore(name?.toLowerCase());
  return { status: 200, codename: result };
};
