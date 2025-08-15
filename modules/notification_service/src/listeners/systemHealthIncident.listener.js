const kafka = require("../utils/kafka.client.js");
const { getDocument } = require("../utils/elasticsearch.js");
const { notificationService } = require("../services");
const consumer = kafka.consumer({
  groupId: `salesai1-notification-service-systemHealthIncident-group`,
});

const systemHealthIncidentListener = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "observability.anomalyEvent.created",
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
          template: "systemHealthIncidentPush",
          metadata: {
            ...notice,
            actionDeepLink: "&#39;/system/health/&#39; + id",
            actionText: "&#39;View Details&#39;",
          },
        };

        const dataViewId = notice.id;
        const dataSource = await getDocument(
          "salesai1_systemHealthIncidentView",
          dataViewId,
        );

        this.dataSource = dataSource.source;
        mappedData.metadata = {
          ...mappedData.metadata,
          dataSource: dataSource.source,
        };

        if (
          !(
            (this.dataSource.anomalyType === "systemFailure" ||
              this.dataSource.anomalyType === "healthIncident") &&
            (this.dataSource.severity === 2 || this.dataSource.severity === 3)
          )
        ) {
          console.log(
            "condition not met",
            "(this.dataSource.anomalyType === &#39;systemFailure&#39; || this.dataSource.anomalyType === &#39;healthIncident&#39;) &amp;&amp; (this.dataSource.severity === 2 || this.dataSource.severity === 3)",
          );
          return;
        }

        const targetreviewedAdmin =
          mappedData.metadata.dataSource["reviewedByUser"];
        mappedData.to = targetreviewedAdmin;
        await notificationService.sendNotification(mappedData);
      } catch (error) {
        console.error("observability.anomalyEvent.created ", error);
      }
    },
  });
};

module.exports = systemHealthIncidentListener;
