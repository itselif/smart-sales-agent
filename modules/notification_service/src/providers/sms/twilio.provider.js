const twilio = require("twilio");

class TwilloProvider {
  constructor() {
    this.name = "Twillo";
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }
  async send(payload) {
    console.log("Twillo ile SMS gönderiliyor:", payload);
    try {
      await this.client.messages.create(this.mapToData(payload));
      return { success: true, provider: this.name };
    } catch (error) {
      console.error("Twillo ile SMS gönderilirken hata oluştu:", error);
      return { success: false, provider: this.name };
    }
  }

  mapToData(payload) {
    return {
      from: process.env.TWILIO_SENDER,
      to: payload.to,
      body: payload.message,
    };
  }
}

module.exports = TwilloProvider;
