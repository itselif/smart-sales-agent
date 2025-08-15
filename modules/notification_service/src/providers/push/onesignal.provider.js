const axios = require("axios");
class OneSignalProvider {
  constructor() {
    this.name = "OneSignal";
    this.axios = axios.create({
      baseURL: "https://onesignal.com/api/v1/notifications",
      headers: {
        Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
  }
  async send(payload) {
    console.log("OneSignal ile PUSH gönderiliyor:", payload);

    try {
      await this.axios.post("/", this.mapToData(payload));
      return { success: true, provider: "OneSignal" };
    } catch (error) {
      console.error("OneSignal ile PUSH gönderilirken hata oluştu:", error);
      return { success: false, provider: "OneSignal" };
    }
  }

  mapToData(payload) {
    return {
      app_id: process.env.ONESIGNAL_APP_ID,
      contents: { en: payload.body },
      headings: { en: payload.title },
      include_player_ids: [payload.to],
      data: payload.metadata,
    };
  }
}

module.exports = OneSignalProvider;
