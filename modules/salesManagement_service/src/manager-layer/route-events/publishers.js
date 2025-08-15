const { ServicePublisher } = require("serviceCommon");

// SaleTransaction Event Publisher Classes

// Publisher class for createSaleTransaction route
const { SaletransactionCreatedTopic } = require("./topics");
class SaletransactionCreatedPublisher extends ServicePublisher {
  constructor(saletransaction, session, requestId) {
    super(SaletransactionCreatedTopic, saletransaction, session, requestId);
  }

  static async Publish(saletransaction, session, requestId) {
    const _publisher = new SaletransactionCreatedPublisher(
      saletransaction,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for updateSaleTransaction route
const { SaletransactionUpdatedTopic } = require("./topics");
class SaletransactionUpdatedPublisher extends ServicePublisher {
  constructor(saletransaction, session, requestId) {
    super(SaletransactionUpdatedTopic, saletransaction, session, requestId);
  }

  static async Publish(saletransaction, session, requestId) {
    const _publisher = new SaletransactionUpdatedPublisher(
      saletransaction,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for deleteSaleTransaction route
const { SaletransactionDeletedTopic } = require("./topics");
class SaletransactionDeletedPublisher extends ServicePublisher {
  constructor(saletransaction, session, requestId) {
    super(SaletransactionDeletedTopic, saletransaction, session, requestId);
  }

  static async Publish(saletransaction, session, requestId) {
    const _publisher = new SaletransactionDeletedPublisher(
      saletransaction,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// SaleTransactionHistory Event Publisher Classes

module.exports = {
  SaletransactionCreatedPublisher,
  SaletransactionUpdatedPublisher,
  SaletransactionDeletedPublisher,
};
