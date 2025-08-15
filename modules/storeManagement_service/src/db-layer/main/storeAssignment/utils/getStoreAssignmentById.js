const { HttpServerError } = require("common");

let { StoreAssignment } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getStoreAssignmentById = async (storeAssignmentId) => {
  try {
    const storeAssignment = Array.isArray(storeAssignmentId)
      ? await StoreAssignment.findAll({
          where: {
            id: { [Op.in]: storeAssignmentId },
            isActive: true,
          },
        })
      : await StoreAssignment.findOne({
          where: {
            id: storeAssignmentId,
            isActive: true,
          },
        });

    if (!storeAssignment) {
      return null;
    }
    return Array.isArray(storeAssignmentId)
      ? storeAssignment.map((item) => item.getData())
      : storeAssignment.getData();
  } catch (err) {
    console.log(err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingStoreAssignmentById",
      err,
    );
  }
};

module.exports = getStoreAssignmentById;
