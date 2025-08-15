const { HttpServerError } = require("common");

const { StoreAssignment } = require("models");
const { Op } = require("sequelize");

const updateStoreAssignmentByIdList = async (idList, dataClause) => {
  try {
    let rowsCount = null;
    let rows = null;

    const options = {
      where: { id: { [Op.in]: idList }, isActive: true },
      returning: true,
    };

    [rowsCount, rows] = await StoreAssignment.update(dataClause, options);
    const storeAssignmentIdList = rows.map((item) => item.id);
    return storeAssignmentIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenUpdatingStoreAssignmentByIdList",
      err,
    );
  }
};

module.exports = updateStoreAssignmentByIdList;
