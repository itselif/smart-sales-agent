const express = require("express");
const router = express.Router();
const { lowStockAlertViewService } = require("services");

router.get("/", async (req, res) => {
  const datas = await lowStockAlertViewService.getAllAggLowStockAlertView();
  res.json(datas);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const data = await lowStockAlertViewService.getAggLowStockAlertView(id);
  res.json(data);
});

module.exports = router;
