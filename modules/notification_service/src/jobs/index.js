const cron = require("node-cron");
const startCronJobs = async () => {
  cron.schedule("0 0 0 * * *", async () => {
    console.group("Cron Job Started", new Date());
  });
};

module.exports = { startCronJobs };
