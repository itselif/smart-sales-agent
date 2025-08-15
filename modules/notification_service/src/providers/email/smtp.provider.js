const nodemailer = require("nodemailer");
class SmtpProvider {
  constructor() {
    this.name = "Smtp";
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  async send(payload) {
    // Smtp API entegrasyonu
    console.log("Smtp ile EMAIL gönderiliyor:", payload);
    try {
      await this.transporter.sendMail(this.mapToData(payload));
      return { success: true, provider: this.name };
    } catch (error) {
      console.error("Smtp ile EMAIL gönderilirken hata oluştu:", error);
      return { success: false, provider: this.name };
    }
  }

  mapToData(payload) {
    return {
      from: process.env.SMTP_FROM_EMAIL,
      to: payload.to,
      subject: payload.subject,
      text: payload.body,
      html: payload.html,
    };
  }
}

module.exports = SmtpProvider;
