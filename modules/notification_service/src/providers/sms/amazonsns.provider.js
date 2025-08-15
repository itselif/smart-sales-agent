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
    console.log("AmazonSNS ile SMS gönderiliyor:", payload);
    try {
      await this.sns.publish(this.mapToData(payload)).promise();
      return { success: true, provider: this.name };
    } catch (error) {
      console.error("AmazonSNS ile SMS gönderilirken hata oluştu:", error);
      return { success: false, provider: this.name };
    }
  }

  mapToData(payload) {
    return {
      message: payload.message,
      phoneNumber: payload.to,
    };
  }
}

module.exports = AmazonSNSProvider;
