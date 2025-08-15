const {
  getAllSaleTransactionCorrectionAuditView,
  getSaleTransactionCorrectionAuditView,
} = require("aggregates/saleTransactionCorrectionAuditView.aggregate");

const getAllAggSaleTransactionCorrectionAuditView = async () => {
  try {
    const data = await getAllSaleTransactionCorrectionAuditView();
    return data;
  } catch (err) {
    console.error("Error: ", err);
    return [];
  }
};

const getAggSaleTransactionCorrectionAuditView = async (id) => {
  try {
    const data = await getSaleTransactionCorrectionAuditView(id);
    return data;
  } catch (err) {
    console.error("Error: ", err);
    return {};
  }
};

module.exports = {
  getAllAggSaleTransactionCorrectionAuditView,
  getAggSaleTransactionCorrectionAuditView,
};
