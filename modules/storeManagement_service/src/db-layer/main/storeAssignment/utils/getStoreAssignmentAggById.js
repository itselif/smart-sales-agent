const { HttpServerError, NotFoundError } = require("common");
const { hexaLogger } = require("common");

const { Store, StoreAssignment } = require("models");
const { Op } = require("sequelize");

const getStoreAssignmentAggById = async (storeAssignmentId) => {
  try {
    const forWhereClause = false;
    const includes = [];

    const storeAssignment = Array.isArray(storeAssignmentId)
      ? await StoreAssignment.findAll({
          where: {
            id: { [Op.in]: storeAssignmentId },
            isActive: true,
          },
          include: includes,
        })
      : await StoreAssignment.findOne({
          where: {
            id: storeAssignmentId,
            isActive: true,
          },
          include: includes,
        });

    if (!storeAssignment) {
      return null;
    }

    const storeAssignmentData =
      Array.isArray(storeAssignmentId) && storeAssignmentId.length > 0
        ? storeAssignment.map((item) => item.getData())
        : storeAssignment.getData();
    await StoreAssignment.getCqrsJoins(storeAssignmentData);
    return storeAssignmentData;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingStoreAssignmentAggById",
      err,
    );
  }
};

module.exports = getStoreAssignmentAggById;
