class AmazonSNSProvider {
  async send(payload) {
    // AmazonSNS API entegrasyonu
    console.log("AmazonSNS ile EMAIL gönderiliyor:", payload);
    return { success: true, provider: "AmazonSNS" };
  }
}

module.exports = AmazonSNSProvider;
