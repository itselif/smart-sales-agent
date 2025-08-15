const AWS = require("aws-sdk");
class AmazonSNSProvider {
  constructor() {
    this.name = "AmazonSNS";
    this.sns = new AWS.SNS({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_REGION,
    });
  }
  async send(payload) {
    console.log("AmazonSNS ile PUSH gönderiliyor:", payload);
    try {
      await this.sns.publish(this.mapToData(payload)).promise();
      return { success: true, provider: this.name };
    } catch (error) {
      console.error("AmazonSNS ile PUSH gönderilirken hata oluştu:", error);
      return { success: false, provider: this.name };
    }
  }

  mapToData(payload) {
    return {
      Message: JSON.stringify({
        default: payload.body,
        APNS: JSON.stringify({
          aps: {
            alert: {
              title: payload.title,
              body: payload.body,
            },
          },
          ...payload.metadata,
        }),
        // Android için ek parametreler
        GCM: JSON.stringify({
          notification: {
            title: payload.title,
            body: payload.body,
          },
          ...payload.metadata,
        }),
      }),
      MessageStructure: "json",
      TargetArn: payload.to, // Hedef cihazın endpoint ARN'si
    };
  }
}

module.exports = AmazonSNSProvider;
