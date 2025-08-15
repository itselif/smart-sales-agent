const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { hexaLogger } = require("common");
const { User } = require("models");
const { Op } = require("sequelize");

const getUserByStoreId = async (storeId) => {
  try {
    const user = await User.findOne({
      where: {
        storeId: storeId,
        isActive: true,
      },
    });

    if (!user) {
      return null;
    }
    return user.getData();
  } catch (err) {
    throw new HttpServerError("errMsg_dbErrorWhenRequestingUserByStoreId", err);
  }
};

module.exports = getUserByStoreId;
