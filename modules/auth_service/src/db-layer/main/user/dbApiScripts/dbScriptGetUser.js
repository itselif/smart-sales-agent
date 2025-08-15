// This script is written as api-specific
// This script is called from the GetUserManager

const { User } = require("models");
const { UserEntityCache } = require("./entity-cache-classes.js");

const dbScriptGetUser = async (apiManager) => {
  try {
    const entityCacher = new UserEntityCache();
    const cachedData = await entityCacher.getUserById(apiManager.userId);
    if (cachedData) return cachedData();

    const whereClause = apiManager.whereClause;
    const options = { where: whereClause, include: null };

    const selectList = apiManager.getSelectList() ?? [];
    if (selectList.length) {
      options.attributes = selectList;
    }
    options.limit = null;

    console.log("options", options);

    let rowData = await User.findOne(options);
    if (Array.isArray(rowData)) rowData = rowData[0];

    if (!rowData) {
      if (apiManager.nullResult) return null;
      throw new NotFoundError("errMsg_RecordNotFound");
    }

    const dbData = rowData.getData();
    apiManager.user = dbData;

    return dbData;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    console.log(err);
    throw new HttpServerError("errMsg_dbErrorWhenExecuting_dbScriptGetUser", {
      whereClause: normalizeSequalizeOps(whereClause),
      errorName: err.name,
      errorMessage: err.message,
      errorStack: err.stack,
      checkoutResult: apiManager.checkoutResult,
    });
  }
};

module.exports = dbScriptGetUser;
