const { GetStoreByCodenameManager } = require("managers");

const AuthRestController = require("../../AuthServiceRestController");

class GetStoreByCodenameRestController extends AuthRestController {
  constructor(req, res) {
    super("getStoreByCodename", "getstorebycodename", req, res);
    this.dataName = "store";
    this.crudType = "get";
    this.status = 200;
    this.httpMethod = "GET";
  }

  createApiManager() {
    return new GetStoreByCodenameManager(this._req, "rest");
  }
}

const getStoreByCodename = async (req, res, next) => {
  const getStoreByCodenameRestController = new GetStoreByCodenameRestController(
    req,
    res,
  );
  try {
    await getStoreByCodenameRestController.processRequest();
  } catch (err) {
    return next(err);
  }
};

module.exports = getStoreByCodename;
