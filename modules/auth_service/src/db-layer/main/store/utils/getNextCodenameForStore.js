const { HttpServerError } = require("common");

let { Store } = require("models");
const { Op, fn, col, where, literal } = require("sequelize");

const getNextCodenameForStore = async (name) => {
  try {
    const escaped = name.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regexPattern = `^${escaped}(\\d+)?$`;
    //should i integrate soft delete part here

    const matchingRecords = await Store.findAll({
      attributes: ["codename"],
      where: {
        [Op.and]: [
          where(col("codename"), {
            [Op.regexp]: regexPattern,
          }),
          { isActive: true },
        ],
      },
    });

    const taken = new Set();

    matchingRecords.forEach(({ codename }) => {
      const match = codename.match(new RegExp(`^${escaped}(\\d+)?$`));
      if (match) {
        const suffix = match[1] ? parseInt(match[1], 10) : 0;
        if (!isNaN(suffix)) {
          taken.add(suffix);
        }
      }
    });

    // If plain project name (suffix 0) is free, use it
    if (!taken.has(0)) return name;

    // Find next available number
    let i = 1;
    while (taken.has(i)) i++;

    return `${name}${i}`;
  } catch (err) {
    console.log(err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenGettingNextCodenameForStore",
      err,
    );
  }
};

module.exports = getNextCodenameForStore;
