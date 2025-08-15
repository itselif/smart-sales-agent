const kafka = require("../utils/kafka.client.js");
const { getDocument } = require("../utils/elasticsearch.js");
const { notificationService } = require("../services");
const consumer = kafka.consumer({
  groupId: `salesai1-notification-service-reportReadyForDownload-group`,
});

const reportReadyForDownloadListener = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "reporting.reportFile.created",
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
          template: "reportReadyForDownloadEmail",
          metadata: {
            ...notice,
            actionDeepLink: "this.dataSource.signedUrl",
            actionText: "&#39;Download Report&#39;",
          },
        };

        const dataViewId = notice.id;
        const dataSource = await getDocument(
          "salesai1_reportReadyForDownloadView",
          dataViewId,
        );

        this.dataSource = dataSource.source;
        mappedData.metadata = {
          ...mappedData.metadata,
          dataSource: dataSource.source,
        };

        const targetreportRequestingUser =
          mappedData.metadata.dataSource["requestingUser"];
        mappedData.to = targetreportRequestingUser;
        await notificationService.sendNotification(mappedData);
      } catch (error) {
        console.error("reporting.reportFile.created ", error);
      }
    },
  });
};

module.exports = reportReadyForDownloadListener;
