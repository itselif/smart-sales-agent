const express = require("express");
const router = express.Router();
const { reportReadyForDownloadViewService } = require("services");

router.get("/", async (req, res) => {
  const datas =
    await reportReadyForDownloadViewService.getAllAggReportReadyForDownloadView();
  res.json(datas);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const data =
    await reportReadyForDownloadViewService.getAggReportReadyForDownloadView(
      id,
    );
  res.json(data);
});

module.exports = router;
