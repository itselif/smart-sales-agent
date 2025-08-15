// This script is written as api-specific
// This script is called from the DeleteUserManager

const { User } = require("models");
const { UserEntityCache } = require("./entity-cache-classes.js");

const { UserQueryCacheInvalidator } = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");

const { ServicePublisher } = require("serviceCommon");

async function raiseDbEvent(apiManager) {
  const dbEvent = apiManager.getDbEventTopic("delete");

  try {
    const _publisher = new ServicePublisher(
      dbEvent,
      apiManager.user,
      apiManager.session,
      apiManager.requestId,
    );
    await _publisher.publish();
  } catch (err) {
    console.log("DbEvent cant be published", dbEvent, err);
  }
}

const dbScriptDeleteUser = async (apiManager) => {
  try {
    const whereClause = apiManager.whereClause;

    let rowsCount = null;
    let dbDoc = null;
    [rowsCount, [dbDoc]] = await User.update(
      { isActive: false },
      {
        where: whereClause,
        returning: true,
      },
    );
    const dbData = dbDoc ? dbDoc.getData() : null;

    if (!dbData) {
      if (apiManager.nullResult) return null;
      throw new NotFoundError("errMsg_RecordNotFoundToDelete");
    }

    apiManageruser = dbData;

    const entityCacher = new UserEntityCache();
    entityCacher.defaultId = dbData.id;
    entityCacher.delEntityFromCache(dbData.id);

    const elasticIndexer = new ElasticIndexer(
      "user",
      apiManager.session,
      apiManager.requestId,
    );
    await elasticIndexer.deleteData(dbData.id);

    // invalidate the query caches that are related with this object's old state
    const queryCacheInvalidator = new UserQueryCacheInvalidator();
    const oldDbData = apiManager.getInstance();
    queryCacheInvalidator.invalidateCache(oldDbData);

    await raiseDbEvent(apiManager);

    return dbData;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    console.log(err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenExecuting_dbScriptDeleteUser",
      {
        whereClause: normalizeSequalizeOps(whereClause),
        errorName: err.name,
        errorMessage: err.message,
        errorStack: err.stack,
        checkoutResult: apiManager.checkoutResult,
      },
    );
  }
};

module.exports = dbScriptDeleteUser;
