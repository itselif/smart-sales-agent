const express = require("express");

// Edge functions Rest Api Router
const edgeRouter = express.Router();

edgeRouter.get("/helloworld", require("./helloWorld-rest"));

edgeRouter.post("/sendmail", require("./sendMail-rest"));

edgeRouter.get(
  "/getNextCodenameForStore",
  require("./getNextCodenameForStore-rest"),
);

module.exports = {
  edgeRouter,
};
