const express = require("express");
const router = express.Router();
const { ciCdJobStatusNotificationViewService } = require("services");

router.get("/", async (req, res) => {
  const datas =
    await ciCdJobStatusNotificationViewService.getAllAggCiCdJobStatusNotificationView();
  res.json(datas);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const data =
    await ciCdJobStatusNotificationViewService.getAggCiCdJobStatusNotificationView(
      id,
    );
  res.json(data);
});

module.exports = router;
