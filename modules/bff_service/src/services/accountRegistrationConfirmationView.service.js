const {
  getAllAccountRegistrationConfirmationView,
  getAccountRegistrationConfirmationView,
} = require("aggregates/accountRegistrationConfirmationView.aggregate");

const getAllAggAccountRegistrationConfirmationView = async () => {
  try {
    const data = await getAllAccountRegistrationConfirmationView();
    return data;
  } catch (err) {
    console.error("Error: ", err);
    return [];
  }
};

const getAggAccountRegistrationConfirmationView = async (id) => {
  try {
    const data = await getAccountRegistrationConfirmationView(id);
    return data;
  } catch (err) {
    console.error("Error: ", err);
    return {};
  }
};

module.exports = {
  getAllAggAccountRegistrationConfirmationView,
  getAggAccountRegistrationConfirmationView,
};
