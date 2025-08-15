const cron = require("node-cron");
const { repairService } = require("services");
const startRepairJobs = async () => {
  cron.schedule("0 0 * * * *", async () => {
    console.group("Cron Job Started", new Date());
    await repairService.runAllRepair();
    console.groupEnd();
  });
};

module.exports = { startRepairJobs };
