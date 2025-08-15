# EVENT API GUIDE

## BFF SERVICE

The BFF service is a microservice that acts as a bridge between the client and backend services. It provides a unified API for the client to interact with multiple backend services, simplifying the communication process and improving performance.

## Architectural Design Credit and Contact Information

The architectural design of this microservice is credited to.  
For inquiries, feedback, or further information regarding the architecture, please direct your communication to:

**Email**:

We encourage open communication and welcome any questions or discussions related to the architectural aspects of this microservice.

## Documentation Scope

Welcome to the official documentation for the BFF Service Event Listeners. This guide details the Kafka-based event listeners responsible for reacting to ElasticSearch index events. It describes listener responsibilities, the topics they subscribe to, and expected payloads.

**Intended Audience**  
This documentation is intended for developers, architects, and system administrators involved in the design, implementation, and maintenance of the BFF Service. It assumes familiarity with microservices architecture, the Kafka messaging system, and ElasticSearch.

**Overview**  
Each ElasticSearch index operation (create, update, delete) emits a corresponding event to Kafka. These events are consumed by listeners responsible for executing aggregate functions to ensure index- and system-level consistency.

## Kafka Event Listeners

  
  
  
  
  
  
  

### Kafka Event Listener: saleTransaction-created

**Event Topic**: `elastic-index-saleTransaction-created`

When a `saleTransaction` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `salesDashboardViewAggregateData` function to enrich and store the final document in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```

### Kafka Event Listener: saleTransaction-updated

**Event Topic**: `elastic-index-saleTransaction-updated`

When a `saleTransaction` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `salesDashboardViewAggregateData` function to update the enriched document in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```

### Kafka Event Listener: saleTransaction-deleted

**Event Topic**: `elastic-index-saleTransaction-deleted`

When a `saleTransaction` is deleted in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `salesDashboardViewAggregateData` function to handle removal or cleanup in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```


### Kafka Event Listener: store-created

**Event Topic**: `elastic-index-store-created`

When a `store` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `storeInfoReSalesDashboardView` function to update dependent documents in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```

### Kafka Event Listener: store-updated

**Event Topic**: `elastic-index-store-updated`

When a `store` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `storeInfoReSalesDashboardView` function to re-enrich dependent data in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```

### Kafka Event Listener: store-deleted

**Event Topic**: `elastic-index-store-deleted`

When a `store` is deleted from the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `storeInfoReSalesDashboardView` function to handle dependent data cleanup or updates.

**Expected Payload**:
```json
{
  "id": "String"
}
```


### Kafka Event Listener: user-created

**Event Topic**: `elastic-index-user-created`

When a `user` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `sellerInfoReSalesDashboardView` function to update dependent documents in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```

### Kafka Event Listener: user-updated

**Event Topic**: `elastic-index-user-updated`

When a `user` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `sellerInfoReSalesDashboardView` function to re-enrich dependent data in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```

### Kafka Event Listener: user-deleted

**Event Topic**: `elastic-index-user-deleted`

When a `user` is deleted from the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `sellerInfoReSalesDashboardView` function to handle dependent data cleanup or updates.

**Expected Payload**:
```json
{
  "id": "String"
}
```



  

### Kafka Event Listener: inventoryItem-created

**Event Topic**: `elastic-index-inventoryItem-created`

When a `inventoryItem` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `inventoryDashboardViewAggregateData` function to enrich and store the final document in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```

### Kafka Event Listener: inventoryItem-updated

**Event Topic**: `elastic-index-inventoryItem-updated`

When a `inventoryItem` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `inventoryDashboardViewAggregateData` function to update the enriched document in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```

### Kafka Event Listener: inventoryItem-deleted

**Event Topic**: `elastic-index-inventoryItem-deleted`

When a `inventoryItem` is deleted in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `inventoryDashboardViewAggregateData` function to handle removal or cleanup in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```


### Kafka Event Listener: store-created

**Event Topic**: `elastic-index-store-created`

When a `store` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `storeInfoReInventoryDashboardView` function to update dependent documents in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```

### Kafka Event Listener: store-updated

**Event Topic**: `elastic-index-store-updated`

When a `store` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `storeInfoReInventoryDashboardView` function to re-enrich dependent data in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```

### Kafka Event Listener: store-deleted

**Event Topic**: `elastic-index-store-deleted`

When a `store` is deleted from the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `storeInfoReInventoryDashboardView` function to handle dependent data cleanup or updates.

**Expected Payload**:
```json
{
  "id": "String"
}
```


### Kafka Event Listener: lowStockAlert-created

**Event Topic**: `elastic-index-lowStockAlert-created`

When a `lowStockAlert` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `lowStockAlertsReInventoryDashboardView` function to update dependent documents in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```

### Kafka Event Listener: lowStockAlert-updated

**Event Topic**: `elastic-index-lowStockAlert-updated`

When a `lowStockAlert` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `lowStockAlertsReInventoryDashboardView` function to re-enrich dependent data in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```

### Kafka Event Listener: lowStockAlert-deleted

**Event Topic**: `elastic-index-lowStockAlert-deleted`

When a `lowStockAlert` is deleted from the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `lowStockAlertsReInventoryDashboardView` function to handle dependent data cleanup or updates.

**Expected Payload**:
```json
{
  "id": "String"
}
```



  

### Kafka Event Listener: auditLog-created

**Event Topic**: `elastic-index-auditLog-created`

When a `auditLog` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `auditLogViewAggregateData` function to enrich and store the final document in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```

### Kafka Event Listener: auditLog-updated

**Event Topic**: `elastic-index-auditLog-updated`

When a `auditLog` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `auditLogViewAggregateData` function to update the enriched document in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```

### Kafka Event Listener: auditLog-deleted

**Event Topic**: `elastic-index-auditLog-deleted`

When a `auditLog` is deleted in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `auditLogViewAggregateData` function to handle removal or cleanup in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```


### Kafka Event Listener: user-created

**Event Topic**: `elastic-index-user-created`

When a `user` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `userInfoReAuditLogView` function to update dependent documents in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```

### Kafka Event Listener: user-updated

**Event Topic**: `elastic-index-user-updated`

When a `user` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `userInfoReAuditLogView` function to re-enrich dependent data in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```

### Kafka Event Listener: user-deleted

**Event Topic**: `elastic-index-user-deleted`

When a `user` is deleted from the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `userInfoReAuditLogView` function to handle dependent data cleanup or updates.

**Expected Payload**:
```json
{
  "id": "String"
}
```


### Kafka Event Listener: store-created

**Event Topic**: `elastic-index-store-created`

When a `store` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `storeInfoReAuditLogView` function to update dependent documents in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```

### Kafka Event Listener: store-updated

**Event Topic**: `elastic-index-store-updated`

When a `store` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `storeInfoReAuditLogView` function to re-enrich dependent data in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```

### Kafka Event Listener: store-deleted

**Event Topic**: `elastic-index-store-deleted`

When a `store` is deleted from the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `storeInfoReAuditLogView` function to handle dependent data cleanup or updates.

**Expected Payload**:
```json
{
  "id": "String"
}
```



  

### Kafka Event Listener: store-created

**Event Topic**: `elastic-index-store-created`

When a `store` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `crossStoreComparisonViewAggregateData` function to enrich and store the final document in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```

### Kafka Event Listener: store-updated

**Event Topic**: `elastic-index-store-updated`

When a `store` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `crossStoreComparisonViewAggregateData` function to update the enriched document in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```

### Kafka Event Listener: store-deleted

**Event Topic**: `elastic-index-store-deleted`

When a `store` is deleted in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `crossStoreComparisonViewAggregateData` function to handle removal or cleanup in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```


### Kafka Event Listener: storeAssignment-created

**Event Topic**: `elastic-index-storeAssignment-created`

When a `storeAssignment` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `activeSellersReCrossStoreComparisonView` function to update dependent documents in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```

### Kafka Event Listener: storeAssignment-updated

**Event Topic**: `elastic-index-storeAssignment-updated`

When a `storeAssignment` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `activeSellersReCrossStoreComparisonView` function to re-enrich dependent data in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```

### Kafka Event Listener: storeAssignment-deleted

**Event Topic**: `elastic-index-storeAssignment-deleted`

When a `storeAssignment` is deleted from the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `activeSellersReCrossStoreComparisonView` function to handle dependent data cleanup or updates.

**Expected Payload**:
```json
{
  "id": "String"
}
```


### Kafka Event Listener: storeAssignment-created

**Event Topic**: `elastic-index-storeAssignment-created`

When a `storeAssignment` is created in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `activeManagersReCrossStoreComparisonView` function to update dependent documents in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```

### Kafka Event Listener: storeAssignment-updated

**Event Topic**: `elastic-index-storeAssignment-updated`

When a `storeAssignment` is updated in the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `activeManagersReCrossStoreComparisonView` function to re-enrich dependent data in the related index.

**Expected Payload**:
```json
{
  "id": "String"
}
```

### Kafka Event Listener: storeAssignment-deleted

**Event Topic**: `elastic-index-storeAssignment-deleted`

When a `storeAssignment` is deleted from the ElasticSearch index, this listener is triggered. It parses the event payload, extracts the entity ID, and invokes the `activeManagersReCrossStoreComparisonView` function to handle dependent data cleanup or updates.

**Expected Payload**:
```json
{
  "id": "String"
}
```



  
  


