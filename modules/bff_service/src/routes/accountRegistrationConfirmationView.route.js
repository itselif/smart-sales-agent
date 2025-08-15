const express = require("express");
const router = express.Router();
const { accountRegistrationConfirmationViewService } = require("services");

router.get("/", async (req, res) => {
  const datas =
    await accountRegistrationConfirmationViewService.getAllAggAccountRegistrationConfirmationView();
  res.json(datas);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const data =
    await accountRegistrationConfirmationViewService.getAggAccountRegistrationConfirmationView(
      id,
    );
  res.json(data);
});

module.exports = router;
