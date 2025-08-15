const { sendSmptEmail } = require("common");
module.exports = async (request) => {
  /* E.g. for admin support notifications */ const { to, subject, text } =
    request.body;
  const emailFrom = request.session?.email ?? "admin@platform.local";
  await sendSmptEmail({ emailFrom, to, subject, text });
  return { status: 201, message: "Mail sent", date: new Date().toISOString() };
};
