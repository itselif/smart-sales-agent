const { HttpServerError } = require("common");

let { SaleTransaction } = require("models");
const { hexaLogger } = require("common");
const { Op } = require("sequelize");

const getSaleTransactionById = async (saleTransactionId) => {
  try {
    const saleTransaction = Array.isArray(saleTransactionId)
      ? await SaleTransaction.findAll({
          where: {
            id: { [Op.in]: saleTransactionId },
            isActive: true,
          },
        })
      : await SaleTransaction.findOne({
          where: {
            id: saleTransactionId,
            isActive: true,
          },
        });

    if (!saleTransaction) {
      return null;
    }
    return Array.isArray(saleTransactionId)
      ? saleTransaction.map((item) => item.getData())
      : saleTransaction.getData();
  } catch (err) {
    console.log(err);
    throw new HttpServerError(
      "errMsg_dbErrorWhenRequestingSaleTransactionById",
      err,
    );
  }
};

module.exports = getSaleTransactionById;
