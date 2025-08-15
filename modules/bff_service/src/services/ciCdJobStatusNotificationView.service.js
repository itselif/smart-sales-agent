const {
  getAllCiCdJobStatusNotificationView,
  getCiCdJobStatusNotificationView,
} = require("aggregates/ciCdJobStatusNotificationView.aggregate");

const getAllAggCiCdJobStatusNotificationView = async () => {
  try {
    const data = await getAllCiCdJobStatusNotificationView();
    return data;
  } catch (err) {
    console.error("Error: ", err);
    return [];
  }
};

const getAggCiCdJobStatusNotificationView = async (id) => {
  try {
    const data = await getCiCdJobStatusNotificationView(id);
    return data;
  } catch (err) {
    console.error("Error: ", err);
    return {};
  }
};

module.exports = {
  getAllAggCiCdJobStatusNotificationView,
  getAggCiCdJobStatusNotificationView,
};
