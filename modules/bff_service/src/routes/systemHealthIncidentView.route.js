const express = require("express");
const router = express.Router();
const { systemHealthIncidentViewService } = require("services");

router.get("/", async (req, res) => {
  const datas =
    await systemHealthIncidentViewService.getAllAggSystemHealthIncidentView();
  res.json(datas);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const data =
    await systemHealthIncidentViewService.getAggSystemHealthIncidentView(id);
  res.json(data);
});

module.exports = router;
