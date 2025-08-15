const sgMail = require("@sendgrid/mail");
class SendGridProvider {
  constructor() {
    this.name = "SendGrid";
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }
  async send(payload) {
    console.log("SendGrid ile EMAIL gönderiliyor:", payload);
    try {
      await sgMail.send(this.mapToData(payload));
      return { success: true, provider: this.name };
    } catch (error) {
      console.error("SendGrid ile EMAIL gönderilirken hata oluştu:", error);
      return { success: false, provider: this.name };
    }
  }

  mapToData(payload) {
    return {
      to: payload.to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: payload.subject,
      text: payload.body,
      html: payload.html,
    };
  }
}

module.exports = SendGridProvider;
