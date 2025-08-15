const kafka = require("../utils/kafka.client.js");
const { getDocument } = require("../utils/elasticsearch.js");
const { notificationService } = require("../services");
const consumer = kafka.consumer({
  groupId: `salesai1-notification-service-lowStockAlert-group`,
});

const lowStockAlertListener = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "inventoryManagement.lowStockAlert.created",
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        console.log(
          `Received message on ${topic}: ${message.value.toString()}`,
        );

        const notice = JSON.parse(message.value.toString());

        const mappedData = {
          types: ["push"],
          isStored: true,
          template: "lowStockAlertPush",
          metadata: {
            ...notice,
            actionDeepLink: "&#39;/inventory/alerts/&#39; + id",
            actionText: "&#39;View Alert Details&#39;",
          },
        };

        const dataViewId = notice.id;
        const dataSource = await getDocument(
          "salesai1_lowStockAlertView",
          dataViewId,
        );

        this.dataSource = dataSource.source;
        mappedData.metadata = {
          ...mappedData.metadata,
          dataSource: dataSource.source,
        };

        if (
          !(this.dataSource.alertType === 0 || this.dataSource.alertType === 1)
        ) {
          console.log(
            "condition not met",
            "(this.dataSource.alertType === 0 || this.dataSource.alertType === 1)",
          );
          return;
        }

        const targetsstoreSellers = mappedData.metadata.dataSource[""];
        for (const _target of targetsstoreSellers) {
          mappedData.to = _target["storeSellers"];
          await notificationService.sendNotification(mappedData);
        }

        const targetsstoreManagers = mappedData.metadata.dataSource[""];
        for (const _target of targetsstoreManagers) {
          mappedData.to = _target["storeManagers"];
          await notificationService.sendNotification(mappedData);
        }
      } catch (error) {
        console.error("inventoryManagement.lowStockAlert.created ", error);
      }
    },
  });
};

module.exports = lowStockAlertListener;
