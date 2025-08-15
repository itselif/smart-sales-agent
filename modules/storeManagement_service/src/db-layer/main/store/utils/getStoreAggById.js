const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { Store, StoreAssignment } = require("models");
const { Op } = require("sequelize");

const getStoreAggById = async (storeId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const store = Array.isArray(storeId)
      ? await Store.findAll({
          where: {
            id: { [Op.in]: storeId },
            isActive: true,
          },
          include: includes,
        })
      : await Store.findOne({
          where: {
            id: storeId,
            isActive: true,
          },
          include: includes,
        });

    if (!store) {
      return null;
    }

    const storeData =
      Array.isArray(storeId) && storeId.length > 0
        ? store.map((item) => item.getData())
        : store.getData();
    await Store.getCqrsJoins(storeData);
    return storeData;
  } catch (err) {
    throw new HttpServerError("errMsg_dbErrorWhenRequestingStoreAggById", err);
  }
};

module.exports = getStoreAggById;
