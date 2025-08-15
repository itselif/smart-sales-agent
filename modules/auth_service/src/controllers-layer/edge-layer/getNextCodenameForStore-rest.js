const { NotAuthenticatedError } = require("common");
const { getNextCodenameForStore } = require("edgeFunctions");

const getNextCodenameForStoreRestController = async (req, res, next) => {
  try {
    const statusCode = 200;
    const result = await getNextCodenameForStore(req);
    result.statusCode = result.status ?? statusCode;
    if (result.headers) {
      for (const [headerName, headerValue] of Object.entries(result.headers)) {
        res.set(headerName, headerValue);
      }
    }
    res
      .status(result.statusCode)
      .send(result.content ?? result.message ?? result);
  } catch (err) {
    console.error(
      "Error running routeService for getNextCodenameForStore: ",
      err,
    );
    return next(err);
  }
};

module.exports = getNextCodenameForStoreRestController;
