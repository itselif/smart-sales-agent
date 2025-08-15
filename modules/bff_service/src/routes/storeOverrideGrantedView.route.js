const express = require("express");
const router = express.Router();
const { storeOverrideGrantedViewService } = require("services");

router.get("/", async (req, res) => {
  const datas =
    await storeOverrideGrantedViewService.getAllAggStoreOverrideGrantedView();
  res.json(datas);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const data =
    await storeOverrideGrantedViewService.getAggStoreOverrideGrantedView(id);
  res.json(data);
});

module.exports = router;
