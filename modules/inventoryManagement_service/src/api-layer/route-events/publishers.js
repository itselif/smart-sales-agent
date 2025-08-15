const { ServicePublisher } = require("serviceCommon");

// InventoryItem Event Publisher Classes

// Publisher class for createInventoryItem route
const { InventoryitemCreatedTopic } = require("./topics");
class InventoryitemCreatedPublisher extends ServicePublisher {
  constructor(inventoryitem, session, requestId) {
    super(InventoryitemCreatedTopic, inventoryitem, session, requestId);
  }

  static async Publish(inventoryitem, session, requestId) {
    const _publisher = new InventoryitemCreatedPublisher(
      inventoryitem,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for updateInventoryItem route
const { InventoryitemUpdatedTopic } = require("./topics");
class InventoryitemUpdatedPublisher extends ServicePublisher {
  constructor(inventoryitem, session, requestId) {
    super(InventoryitemUpdatedTopic, inventoryitem, session, requestId);
  }

  static async Publish(inventoryitem, session, requestId) {
    const _publisher = new InventoryitemUpdatedPublisher(
      inventoryitem,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for deleteInventoryItem route
const { InventoryitemDeletedTopic } = require("./topics");
class InventoryitemDeletedPublisher extends ServicePublisher {
  constructor(inventoryitem, session, requestId) {
    super(InventoryitemDeletedTopic, inventoryitem, session, requestId);
  }

  static async Publish(inventoryitem, session, requestId) {
    const _publisher = new InventoryitemDeletedPublisher(
      inventoryitem,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// InventoryMovement Event Publisher Classes

// Publisher class for createInventoryMovement route
const { InventorymovementCreatedTopic } = require("./topics");
class InventorymovementCreatedPublisher extends ServicePublisher {
  constructor(inventorymovement, session, requestId) {
    super(InventorymovementCreatedTopic, inventorymovement, session, requestId);
  }

  static async Publish(inventorymovement, session, requestId) {
    const _publisher = new InventorymovementCreatedPublisher(
      inventorymovement,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for deleteInventoryMovement route
const { InventorymovementDeletedTopic } = require("./topics");
class InventorymovementDeletedPublisher extends ServicePublisher {
  constructor(inventorymovement, session, requestId) {
    super(InventorymovementDeletedTopic, inventorymovement, session, requestId);
  }

  static async Publish(inventorymovement, session, requestId) {
    const _publisher = new InventorymovementDeletedPublisher(
      inventorymovement,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// LowStockAlert Event Publisher Classes

// Publisher class for createLowStockAlert route
const { LowstockalertCreatedTopic } = require("./topics");
class LowstockalertCreatedPublisher extends ServicePublisher {
  constructor(lowstockalert, session, requestId) {
    super(LowstockalertCreatedTopic, lowstockalert, session, requestId);
  }

  static async Publish(lowstockalert, session, requestId) {
    const _publisher = new LowstockalertCreatedPublisher(
      lowstockalert,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for resolveLowStockAlert route
const { LowstockalertResolvedTopic } = require("./topics");
class LowstockalertResolvedPublisher extends ServicePublisher {
  constructor(lowstockalert, session, requestId) {
    super(LowstockalertResolvedTopic, lowstockalert, session, requestId);
  }

  static async Publish(lowstockalert, session, requestId) {
    const _publisher = new LowstockalertResolvedPublisher(
      lowstockalert,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for deleteLowStockAlert route
const { LowstockalertDeletedTopic } = require("./topics");
class LowstockalertDeletedPublisher extends ServicePublisher {
  constructor(lowstockalert, session, requestId) {
    super(LowstockalertDeletedTopic, lowstockalert, session, requestId);
  }

  static async Publish(lowstockalert, session, requestId) {
    const _publisher = new LowstockalertDeletedPublisher(
      lowstockalert,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

module.exports = {
  InventoryitemCreatedPublisher,
  InventoryitemUpdatedPublisher,
  InventoryitemDeletedPublisher,
  InventorymovementCreatedPublisher,
  InventorymovementDeletedPublisher,
  LowstockalertCreatedPublisher,
  LowstockalertResolvedPublisher,
  LowstockalertDeletedPublisher,
};
