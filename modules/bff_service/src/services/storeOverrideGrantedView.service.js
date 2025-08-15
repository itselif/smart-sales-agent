const {
  getAllStoreOverrideGrantedView,
  getStoreOverrideGrantedView,
} = require("aggregates/storeOverrideGrantedView.aggregate");

const getAllAggStoreOverrideGrantedView = async () => {
  try {
    const data = await getAllStoreOverrideGrantedView();
    return data;
  } catch (err) {
    console.error("Error: ", err);
    return [];
  }
};

const getAggStoreOverrideGrantedView = async (id) => {
  try {
    const data = await getStoreOverrideGrantedView(id);
    return data;
  } catch (err) {
    console.error("Error: ", err);
    return {};
  }
};

module.exports = {
  getAllAggStoreOverrideGrantedView,
  getAggStoreOverrideGrantedView,
};
