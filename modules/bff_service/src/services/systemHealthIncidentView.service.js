const {
  getAllSystemHealthIncidentView,
  getSystemHealthIncidentView,
} = require("aggregates/systemHealthIncidentView.aggregate");

const getAllAggSystemHealthIncidentView = async () => {
  try {
    const data = await getAllSystemHealthIncidentView();
    return data;
  } catch (err) {
    console.error("Error: ", err);
    return [];
  }
};

const getAggSystemHealthIncidentView = async (id) => {
  try {
    const data = await getSystemHealthIncidentView(id);
    return data;
  } catch (err) {
    console.error("Error: ", err);
    return {};
  }
};

module.exports = {
  getAllAggSystemHealthIncidentView,
  getAggSystemHealthIncidentView,
};
