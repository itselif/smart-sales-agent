const kafka = require("../utils/kafka.client.js");
const { getDocument } = require("../utils/elasticsearch.js");
const { notificationService } = require("../services");
const consumer = kafka.consumer({
  groupId: `salesai1-notification-service-storeOverrideGranted-group`,
});

const storeOverrideGrantedListener = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "storeManagement.storeAssignment.updated",
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
          template: "storeOverrideGrantedEmail",
          metadata: {
            ...notice,
            actionDeepLink: "&#39;/stores/assignments/&#39; + id",
            actionText: "&#39;Review Override&#39;",
          },
        };

        const dataViewId = notice.id;
        const dataSource = await getDocument(
          "salesai1_storeOverrideGrantedView",
          dataViewId,
        );

        this.dataSource = dataSource.source;
        mappedData.metadata = {
          ...mappedData.metadata,
          dataSource: dataSource.source,
        };

        if (
          !(
            this.dataSource.assignmentType === 1 && this.dataSource.status === 0
          )
        ) {
          console.log(
            "condition not met",
            "this.dataSource.assignmentType === 1 &amp;&amp; this.dataSource.status === 0",
          );
          return;
        }

        const targetoverriddenManager =
          mappedData.metadata.dataSource["userInfo"];
        mappedData.to = targetoverriddenManager;
        await notificationService.sendNotification(mappedData);
      } catch (error) {
        console.error("storeManagement.storeAssignment.updated ", error);
      }
    },
  });
};

module.exports = storeOverrideGrantedListener;
