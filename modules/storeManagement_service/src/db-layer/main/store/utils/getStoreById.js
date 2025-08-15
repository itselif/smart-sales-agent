const { HttpServerError } = require("common");

let { Store } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getStoreById = async (storeId) => {
  try {
    const store = Array.isArray(storeId)
      ? await Store.findAll({
          where: {
            id: { [Op.in]: storeId },
            isActive: true,
          },
        })
      : await Store.findOne({
          where: {
            id: storeId,
            isActive: true,
          },
        });

    if (!store) {
      return null;
    }
    return Array.isArray(storeId)
      ? store.map((item) => item.getData())
      : store.getData();
  } catch (err) {
    console.log(err);
    throw new HttpServerError("errMsg_dbErrorWhenRequestingStoreById", err);
  }
};

module.exports = getStoreById;
