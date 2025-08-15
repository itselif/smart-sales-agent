class FakeProvider {
  async send(payload) {
    // Fake API entegrasyonu
    console.log("Fake ile SMS gönderiliyor:", payload);
    return { success: true, provider: "Fake" };
  }
}

module.exports = FakeProvider;
