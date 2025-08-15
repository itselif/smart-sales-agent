const axios = require("axios");
class NetGSMProvider {
  constructor() {
    this.name = "NetGSM";
    this.axios = axios.create({
      baseURL: "https://api.netgsm.com.tr/sms/send",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }
  async send(payload) {
    console.log("NetGSM ile SMS gönderiliyor:", payload);
    try {
      await this.axios.post("/", this.mapToData(payload));
      return { success: true, provider: this.name };
    } catch (error) {
      console.error("NetGSM ile SMS gönderilirken hata oluştu:", error);
      return { success: false, provider: this.name };
    }
  }

  mapToData(payload) {
    return {
      username: process.env.NETGSM_USER,
      password: process.env.NETGSM_PASS,
      source_addr: process.env.NETGSM_SENDER,
      target_addr: payload.to,
      message: payload.message,
      msg_type: "text",
      encoding: "utf-8",
      request_mode: 1,
      valid_until: "",
      send_date: "",
    };
  }
}

module.exports = NetGSMProvider;
