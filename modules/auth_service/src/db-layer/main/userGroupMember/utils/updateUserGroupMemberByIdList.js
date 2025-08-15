const { HttpServerError } = require("common");

const { UserGroupMember } = require("models");
const { Op } = require("sequelize");

const updateUserGroupMemberByIdList = async (idList, dataClause) => {
  try {
    let rowsCount = null;
    let rows = null;

    const options = {
      where: { id: { [Op.in]: idList }, isActive: true },
      returning: true,
    };

    [rowsCount, rows] = await UserGroupMember.update(dataClause, options);
    const userGroupMemberIdList = rows.map((item) => item.id);
    return userGroupMemberIdList;
  } catch (err) {
    throw new HttpServerError(
      "errMsg_dbErrorWhenUpdatingUserGroupMemberByIdList",
      err,
    );
  }
};

module.exports = updateUserGroupMemberByIdList;
