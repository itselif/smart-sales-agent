const {
  getAllReportReadyForDownloadView,
  getReportReadyForDownloadView,
} = require("aggregates/reportReadyForDownloadView.aggregate");

const getAllAggReportReadyForDownloadView = async () => {
  try {
    const data = await getAllReportReadyForDownloadView();
    return data;
  } catch (err) {
    console.error("Error: ", err);
    return [];
  }
};

const getAggReportReadyForDownloadView = async (id) => {
  try {
    const data = await getReportReadyForDownloadView(id);
    return data;
  } catch (err) {
    console.error("Error: ", err);
    return {};
  }
};

module.exports = {
  getAllAggReportReadyForDownloadView,
  getAggReportReadyForDownloadView,
};
