const axios = require("axios");
class VonageProvider {
  constructor() {
    this.name = "Vonage";
    this.axios = axios.create({
      baseURL: "https://api.nexmo.com/v1/messages",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.VONAGE_TOKEN}`,
      },
    });
  }
  async send(payload) {
    console.log("Vonage ile SMS gönderiliyor:", payload);
    try {
      await this.axios.post("/", this.mapToData(payload));
      return { success: true, provider: this.name };
    } catch (error) {
      console.error("Vonage ile SMS gönderilirken hata oluştu:", error);
      return { success: false, provider: this.name };
    }
  }

  mapToData(payload) {
    return {
      message_type: "text",
      text: payload.message,
      to: payload.to,
      from: process.env.VONAGE_SENDER,
      channel: "sms",
    };
  }
}

module.exports = VonageProvider;
