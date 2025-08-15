const axios = require("axios");
class FirebaseProvider {
  constructor() {
    this.name = "Firebase";
    this.axios = axios.create({
      baseURL: "https://fcm.googleapis.com/fcm/send",
      headers: {
        Authorization: `key=${process.env.FIREBASE_KEY}`,
        "Content-Type": "application/json",
      },
    });
  }
  async send(payload) {
    console.log("Firebase ile PUSH gönderiliyor:", payload);

    try {
      await this.axios.post("/", this.mapToData(payload));
      return { success: true, provider: "Firebase" };
    } catch (error) {
      console.error("Firebase ile PUSH gönderilirken hata oluştu:", error);
      return { success: false, provider: "Firebase" };
    }
  }

  mapToData(payload) {
    return {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      to: payload.to,
      data: payload.metadata,
    };
  }
}

module.exports = FirebaseProvider;
