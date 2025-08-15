const { ServicePublisher } = require("serviceCommon");

// Store Event Publisher Classes

// Publisher class for createStore route
const { StoreCreatedTopic } = require("./topics");
class StoreCreatedPublisher extends ServicePublisher {
  constructor(store, session, requestId) {
    super(StoreCreatedTopic, store, session, requestId);
  }

  static async Publish(store, session, requestId) {
    const _publisher = new StoreCreatedPublisher(store, session, requestId);
    await _publisher.publish();
  }
}

// Publisher class for updateStore route
const { StoreUpdatedTopic } = require("./topics");
class StoreUpdatedPublisher extends ServicePublisher {
  constructor(store, session, requestId) {
    super(StoreUpdatedTopic, store, session, requestId);
  }

  static async Publish(store, session, requestId) {
    const _publisher = new StoreUpdatedPublisher(store, session, requestId);
    await _publisher.publish();
  }
}

// Publisher class for deleteStore route
const { StoreDeletedTopic } = require("./topics");
class StoreDeletedPublisher extends ServicePublisher {
  constructor(store, session, requestId) {
    super(StoreDeletedTopic, store, session, requestId);
  }

  static async Publish(store, session, requestId) {
    const _publisher = new StoreDeletedPublisher(store, session, requestId);
    await _publisher.publish();
  }
}

// StoreAssignment Event Publisher Classes

// Publisher class for createStoreAssignment route
const { StoreassignmentCreatedTopic } = require("./topics");
class StoreassignmentCreatedPublisher extends ServicePublisher {
  constructor(storeassignment, session, requestId) {
    super(StoreassignmentCreatedTopic, storeassignment, session, requestId);
  }

  static async Publish(storeassignment, session, requestId) {
    const _publisher = new StoreassignmentCreatedPublisher(
      storeassignment,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for updateStoreAssignment route
const { StoreassignmentUpdatedTopic } = require("./topics");
class StoreassignmentUpdatedPublisher extends ServicePublisher {
  constructor(storeassignment, session, requestId) {
    super(StoreassignmentUpdatedTopic, storeassignment, session, requestId);
  }

  static async Publish(storeassignment, session, requestId) {
    const _publisher = new StoreassignmentUpdatedPublisher(
      storeassignment,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

// Publisher class for deleteStoreAssignment route
const { StoreassignmentDeletedTopic } = require("./topics");
class StoreassignmentDeletedPublisher extends ServicePublisher {
  constructor(storeassignment, session, requestId) {
    super(StoreassignmentDeletedTopic, storeassignment, session, requestId);
  }

  static async Publish(storeassignment, session, requestId) {
    const _publisher = new StoreassignmentDeletedPublisher(
      storeassignment,
      session,
      requestId,
    );
    await _publisher.publish();
  }
}

module.exports = {
  StoreCreatedPublisher,
  StoreUpdatedPublisher,
  StoreDeletedPublisher,
  StoreassignmentCreatedPublisher,
  StoreassignmentUpdatedPublisher,
  StoreassignmentDeletedPublisher,
};
