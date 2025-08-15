const express = require("express");
const router = express.Router();
const { userRegistrationConfirmationViewService } = require("services");

router.get("/", async (req, res) => {
  const datas =
    await userRegistrationConfirmationViewService.getAllAggUserRegistrationConfirmationView();
  res.json(datas);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const data =
    await userRegistrationConfirmationViewService.getAggUserRegistrationConfirmationView(
      id,
    );
  res.json(data);
});

module.exports = router;
