const {
  getAllLowStockAlertView,
  getLowStockAlertView,
} = require("aggregates/lowStockAlertView.aggregate");

const getAllAggLowStockAlertView = async () => {
  try {
    const data = await getAllLowStockAlertView();
    return data;
  } catch (err) {
    console.error("Error: ", err);
    return [];
  }
};

const getAggLowStockAlertView = async (id) => {
  try {
    const data = await getLowStockAlertView(id);
    return data;
  } catch (err) {
    console.error("Error: ", err);
    return {};
  }
};

module.exports = { getAllAggLowStockAlertView, getAggLowStockAlertView };
