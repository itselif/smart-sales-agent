const express = require("express");
const router = express.Router();
const { saleTransactionCorrectionAuditViewService } = require("services");

router.get("/", async (req, res) => {
  const datas =
    await saleTransactionCorrectionAuditViewService.getAllAggSaleTransactionCorrectionAuditView();
  res.json(datas);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const data =
    await saleTransactionCorrectionAuditViewService.getAggSaleTransactionCorrectionAuditView(
      id,
    );
  res.json(data);
});

module.exports = router;
