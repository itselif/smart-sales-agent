module.exports = {
  createSession: () => {
    const SessionManager = require("./salesai-session");
    return new SessionManager();
  },
};
