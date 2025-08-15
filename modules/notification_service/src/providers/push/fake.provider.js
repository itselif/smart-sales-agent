class FakeProvider {
  async send(payload) {
    // Fake API entegrasyonu
    console.log("Fake ile PUSH gönderiliyor:", payload);
    return { success: true, provider: "Fake" };
  }
}

module.exports = FakeProvider;
