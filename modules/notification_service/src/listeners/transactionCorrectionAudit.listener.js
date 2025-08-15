const kafka = require("../utils/kafka.client.js");
const { getDocument } = require("../utils/elasticsearch.js");
const { notificationService } = require("../services");
const consumer = kafka.consumer({
  groupId: `salesai1-notification-service-transactionCorrectionAudit-group`,
});

const transactionCorrectionAuditListener = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "salesManagement.saleTransactionHistory.created",
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
          types: ["email"],
          isStored: true,
          template: "transactionCorrectionAuditEmail",
          metadata: {
            ...notice,
            actionDeepLink:
              "&#39;/sales/transactions/&#39; + saleTransaction.id",
            actionText: "&#39;Review Correction&#39;",
          },
        };

        const dataViewId = notice.id;
        const dataSource = await getDocument(
          "salesai1_saleTransactionCorrectionAuditView",
          dataViewId,
        );

        this.dataSource = dataSource.source;
        mappedData.metadata = {
          ...mappedData.metadata,
          dataSource: dataSource.source,
        };

        if (
          !(
            this.dataSource.changeType === 0 || this.dataSource.changeType === 1
          )
        ) {
          console.log(
            "condition not met",
            "(this.dataSource.changeType === 0 || this.dataSource.changeType === 1)",
          );
          return;
        }

        const targetsellerOfTransaction =
          mappedData.metadata.dataSource["sellerInfo"];
        mappedData.to = targetsellerOfTransaction;
        await notificationService.sendNotification(mappedData);
      } catch (error) {
        console.error("salesManagement.saleTransactionHistory.created ", error);
      }
    },
  });
};

module.exports = transactionCorrectionAuditListener;
