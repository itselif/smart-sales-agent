module.exports = async (request) => {
  return {
    status: 200,
    message: "Hello admin",
    service: "platformAdmin",
    date: new Date().toISOString(),
  };
};
