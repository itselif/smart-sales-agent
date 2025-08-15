module.exports = {
  createSession: () => {
    const SessionManager = require("./salesai-login-session");
    return new SessionManager();
  },
};
