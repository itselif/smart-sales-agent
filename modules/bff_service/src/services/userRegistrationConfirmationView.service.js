const {
  getAllUserRegistrationConfirmationView,
  getUserRegistrationConfirmationView,
} = require("aggregates/userRegistrationConfirmationView.aggregate");

const getAllAggUserRegistrationConfirmationView = async () => {
  try {
    const data = await getAllUserRegistrationConfirmationView();
    return data;
  } catch (err) {
    console.error("Error: ", err);
    return [];
  }
};

const getAggUserRegistrationConfirmationView = async (id) => {
  try {
    const data = await getUserRegistrationConfirmationView(id);
    return data;
  } catch (err) {
    console.error("Error: ", err);
    return {};
  }
};

module.exports = {
  getAllAggUserRegistrationConfirmationView,
  getAggUserRegistrationConfirmationView,
};
