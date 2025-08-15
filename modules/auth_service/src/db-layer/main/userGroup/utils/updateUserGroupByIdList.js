const { HttpServerError } = require("common");

const { UserGroup } = require("models");
const { Op } = require("sequelize");

const updateUserGroupByIdList = async (idList, dataClause) => {
  try {
    let rowsCount = null;
    let rows = null;

    const options = {
      where: { id: { [Op.in]: idList }, isActive: true },
      returning: true,
    };

    [rowsCount, rows] = await UserGroup.update(dataClause, options);
    const userGroupIdList = rows.map((item) => item.id);
    return userGroupIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenUpdatingUserGroupByIdList",
      err,
    );
  }
};

module.exports = updateUserGroupByIdList;
