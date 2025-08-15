# EVENT GUIDE

## salesai-reporting-service

Generates downloadable daily sales and analytics reports (per store, user, or cross-store/by parameter), issues signed URLs for secure, time-limited access, audits all generation/download activities, and allows admins to configure reporting policies.

## Architectural Design Credit and Contact Information

The architectural design of this microservice is credited to . For inquiries, feedback, or further information regarding the architecture, please direct your communication to:

Email:

We encourage open communication and welcome any questions or discussions related to the architectural aspects of this microservice.

# Documentation Scope

Welcome to the official documentation for the `Reporting` Service Event descriptions. This guide is dedicated to detailing how to subscribe to and listen for state changes within the `Reporting` Service, offering an exclusive focus on event subscription mechanisms.

**Intended Audience**

This documentation is aimed at developers and integrators looking to monitor `Reporting` Service state changes. It is especially relevant for those wishing to implement or enhance business logic based on interactions with `Reporting` objects.

**Overview**

This section provides detailed instructions on monitoring service events, covering payload structures and demonstrating typical use cases through examples.

# Authentication and Authorization

Access to the `Reporting` service's events is facilitated through the project's Kafka server, which is not accessible to the public. Subscription to a Kafka topic requires being on the same network and possessing valid Kafka user credentials. This document presupposes that readers have existing access to the Kafka server.

Additionally, the service offers a public subscription option via REST for real-time data management in frontend applications, secured through REST API authentication and authorization mechanisms. To subscribe to service events via the REST API, please consult the Realtime REST API Guide.

# Database Events

Database events are triggered at the database layer, automatically and atomically, in response to any modifications at the data level. These events serve to notify subscribers about the creation, update, or deletion of objects within the database, distinct from any overarching business logic.

Listening to database events is particularly beneficial for those focused on tracking changes at the database level. A typical use case for subscribing to database events is to replicate the data store of one service within another service's scope, ensuring data consistency and syncronization across services.

For example, while a business operation such as "approve membership" might generate a high-level business event like `membership-approved`, the underlying database changes could involve multiple state updates to different entities. These might be published as separate events, such as `dbevent-member-updated` and `dbevent-user-updated`, reflecting the granular changes at the database level.

Such detailed eventing provides a robust foundation for building responsive, data-driven applications, enabling fine-grained observability and reaction to the dynamics of the data landscape. It also facilitates the architectural pattern of event sourcing, where state changes are captured as a sequence of events, allowing for high-fidelity data replication and history replay for analytical or auditing purposes.

## DbEvent reportRequest-created

**Event topic**: `salesai1-reporting-service-dbevent-reportrequest-created`

This event is triggered upon the creation of a `reportRequest` data object in the database. The event payload encompasses the newly created data, encapsulated within the root of the paylod.

**Event payload**:

```json
{
  "id": "ID",
  "_owner": "ID",
  "requestedByUserId": "ID",
  "reportType": "Enum",
  "reportType_": "String",
  "storeIds": "ID",
  "dateFrom": "Date",
  "dateTo": "Date",
  "productIds": "String",
  "format": "Enum",
  "format_": "String",
  "status": "Enum",
  "status_": "String",
  "isActive": true,
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## DbEvent reportRequest-updated

**Event topic**: `salesai1-reporting-service-dbevent-reportrequest-updated`

Activation of this event follows the update of a `reportRequest` data object. The payload contains the updated information under the `reportRequest` attribute, along with the original data prior to update, labeled as `old_reportRequest`.

**Event payload**:

```json
{
  "old_reportRequest": {
    "id": "ID",
    "_owner": "ID",
    "requestedByUserId": "ID",
    "reportType": "Enum",
    "reportType_": "String",
    "storeIds": "ID",
    "dateFrom": "Date",
    "dateTo": "Date",
    "productIds": "String",
    "format": "Enum",
    "format_": "String",
    "status": "Enum",
    "status_": "String",
    "isActive": true,
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date"
  },
  "reportRequest": {
    "id": "ID",
    "_owner": "ID",
    "requestedByUserId": "ID",
    "reportType": "Enum",
    "reportType_": "String",
    "storeIds": "ID",
    "dateFrom": "Date",
    "dateTo": "Date",
    "productIds": "String",
    "format": "Enum",
    "format_": "String",
    "status": "Enum",
    "status_": "String",
    "isActive": true,
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date"
  }
}
```

## DbEvent reportRequest-deleted

**Event topic**: `salesai1-reporting-service-dbevent-reportrequest-deleted`

This event announces the deletion of a `reportRequest` data object, covering both hard deletions (permanent removal) and soft deletions (where the `isActive` attribute is set to false). Regardless of the deletion type, the event payload will present the data as it was immediately before deletion, highlighting an `isActive` status of false for soft deletions.

**Event payload**:

```json
{
  "id": "ID",
  "_owner": "ID",
  "requestedByUserId": "ID",
  "reportType": "Enum",
  "reportType_": "String",
  "storeIds": "ID",
  "dateFrom": "Date",
  "dateTo": "Date",
  "productIds": "String",
  "format": "Enum",
  "format_": "String",
  "status": "Enum",
  "status_": "String",
  "isActive": false,
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## DbEvent reportFile-created

**Event topic**: `salesai1-reporting-service-dbevent-reportfile-created`

This event is triggered upon the creation of a `reportFile` data object in the database. The event payload encompasses the newly created data, encapsulated within the root of the paylod.

**Event payload**:

```json
{
  "id": "ID",
  "_owner": "ID",
  "reportRequestId": "ID",
  "fileUrl": "String",
  "format": "Enum",
  "format_": "String",
  "signedUrl": "String",
  "signedUrlExpiry": "Date",
  "downloadCount": "Integer",
  "isActive": true,
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## DbEvent reportFile-updated

**Event topic**: `salesai1-reporting-service-dbevent-reportfile-updated`

Activation of this event follows the update of a `reportFile` data object. The payload contains the updated information under the `reportFile` attribute, along with the original data prior to update, labeled as `old_reportFile`.

**Event payload**:

```json
{
  "old_reportFile": {
    "id": "ID",
    "_owner": "ID",
    "reportRequestId": "ID",
    "fileUrl": "String",
    "format": "Enum",
    "format_": "String",
    "signedUrl": "String",
    "signedUrlExpiry": "Date",
    "downloadCount": "Integer",
    "isActive": true,
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date"
  },
  "reportFile": {
    "id": "ID",
    "_owner": "ID",
    "reportRequestId": "ID",
    "fileUrl": "String",
    "format": "Enum",
    "format_": "String",
    "signedUrl": "String",
    "signedUrlExpiry": "Date",
    "downloadCount": "Integer",
    "isActive": true,
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date"
  }
}
```

## DbEvent reportFile-deleted

**Event topic**: `salesai1-reporting-service-dbevent-reportfile-deleted`

This event announces the deletion of a `reportFile` data object, covering both hard deletions (permanent removal) and soft deletions (where the `isActive` attribute is set to false). Regardless of the deletion type, the event payload will present the data as it was immediately before deletion, highlighting an `isActive` status of false for soft deletions.

**Event payload**:

```json
{
  "id": "ID",
  "_owner": "ID",
  "reportRequestId": "ID",
  "fileUrl": "String",
  "format": "Enum",
  "format_": "String",
  "signedUrl": "String",
  "signedUrlExpiry": "Date",
  "downloadCount": "Integer",
  "isActive": false,
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## DbEvent reportPolicy-created

**Event topic**: `salesai1-reporting-service-dbevent-reportpolicy-created`

This event is triggered upon the creation of a `reportPolicy` data object in the database. The event payload encompasses the newly created data, encapsulated within the root of the paylod.

**Event payload**:

```json
{
  "id": "ID",
  "_owner": "ID",
  "reportType": "Enum",
  "reportType_": "String",
  "maxRetentionDays": "Integer",
  "allowedFormats": "Enum",
  "allowedFormats_": "String",
  "description": "Text",
  "isActive": true,
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## DbEvent reportPolicy-updated

**Event topic**: `salesai1-reporting-service-dbevent-reportpolicy-updated`

Activation of this event follows the update of a `reportPolicy` data object. The payload contains the updated information under the `reportPolicy` attribute, along with the original data prior to update, labeled as `old_reportPolicy`.

**Event payload**:

```json
{
  "old_reportPolicy": {
    "id": "ID",
    "_owner": "ID",
    "reportType": "Enum",
    "reportType_": "String",
    "maxRetentionDays": "Integer",
    "allowedFormats": "Enum",
    "allowedFormats_": "String",
    "description": "Text",
    "isActive": true,
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date"
  },
  "reportPolicy": {
    "id": "ID",
    "_owner": "ID",
    "reportType": "Enum",
    "reportType_": "String",
    "maxRetentionDays": "Integer",
    "allowedFormats": "Enum",
    "allowedFormats_": "String",
    "description": "Text",
    "isActive": true,
    "recordVersion": "Integer",
    "createdAt": "Date",
    "updatedAt": "Date"
  }
}
```

## DbEvent reportPolicy-deleted

**Event topic**: `salesai1-reporting-service-dbevent-reportpolicy-deleted`

This event announces the deletion of a `reportPolicy` data object, covering both hard deletions (permanent removal) and soft deletions (where the `isActive` attribute is set to false). Regardless of the deletion type, the event payload will present the data as it was immediately before deletion, highlighting an `isActive` status of false for soft deletions.

**Event payload**:

```json
{
  "id": "ID",
  "_owner": "ID",
  "reportType": "Enum",
  "reportType_": "String",
  "maxRetentionDays": "Integer",
  "allowedFormats": "Enum",
  "allowedFormats_": "String",
  "description": "Text",
  "isActive": false,
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

# ElasticSearch Index Events

Within the `Reporting` service, most data objects are mirrored in ElasticSearch indices, ensuring these indices remain syncronized with their database counterparts through creation, updates, and deletions. These indices serve dual purposes: they act as a data source for external services and furnish aggregated data tailored to enhance frontend user experiences. Consequently, an ElasticSearch index might encapsulate data in its original form or aggregate additional information from other data objects.

These aggregations can include both one-to-one and one-to-many relationships not only with database objects within the same service but also across different services. This capability allows developers to access comprehensive, aggregated data efficiently. By subscribing to ElasticSearch index events, developers are notified when an index is updated and can directly obtain the aggregated entity within the event payload, bypassing the need for separate ElasticSearch queries.

It's noteworthy that some services may augment another service's index by appending to the entity’s `extends` object. In such scenarios, an `*-extended` event will contain only the newly added data. Should you require the complete dataset, you would need to retrieve the full ElasticSearch index entity using the provided ID.

This approach to indexing and event handling facilitates a modular, interconnected architecture where services can seamlessly integrate and react to changes, enriching the overall data ecosystem and enabling more dynamic, responsive applications.

## Index Event reportrequest-created

**Event topic**: `elastic-index-salesai_reportrequest-created`

**Event payload**:

```json
{
  "id": "ID",
  "_owner": "ID",
  "requestedByUserId": "ID",
  "reportType": "Enum",
  "reportType_": "String",
  "storeIds": "ID",
  "dateFrom": "Date",
  "dateTo": "Date",
  "productIds": "String",
  "format": "Enum",
  "format_": "String",
  "status": "Enum",
  "status_": "String",
  "isActive": true,
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Index Event reportrequest-updated

**Event topic**: `elastic-index-salesai_reportrequest-created`

**Event payload**:

```json
{
  "id": "ID",
  "_owner": "ID",
  "requestedByUserId": "ID",
  "reportType": "Enum",
  "reportType_": "String",
  "storeIds": "ID",
  "dateFrom": "Date",
  "dateTo": "Date",
  "productIds": "String",
  "format": "Enum",
  "format_": "String",
  "status": "Enum",
  "status_": "String",
  "isActive": true,
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Index Event reportrequest-deleted

**Event topic**: `elastic-index-salesai_reportrequest-deleted`

**Event payload**:

```json
{
  "id": "ID",
  "_owner": "ID",
  "requestedByUserId": "ID",
  "reportType": "Enum",
  "reportType_": "String",
  "storeIds": "ID",
  "dateFrom": "Date",
  "dateTo": "Date",
  "productIds": "String",
  "format": "Enum",
  "format_": "String",
  "status": "Enum",
  "status_": "String",
  "isActive": true,
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Index Event reportrequest-extended

**Event topic**: `elastic-index-salesai_reportrequest-extended`

**Event payload**:

```js
{
  id: id,
  extends: {
    [extendName]: "Object",
    [extendName + "_count"]: "Number",
  },
}
```

# Route Events

Route events are emitted following the successful execution of a route. While most routes perform CRUD (Create, Read, Update, Delete) operations on data objects, resulting in route events that closely resemble database events, there are distinctions worth noting. A single route execution might trigger multiple CRUD actions and ElasticSearch indexing operations. However, for those primarily concerned with the overarching business logic and its outcomes, listening to the consolidated route event, published once at the conclusion of the route's execution, is more pertinent.

Moreover, routes often deliver aggregated data beyond the primary database object, catering to specific client needs. For instance, creating a data object via a route might not only return the entity's data but also route-specific metrics, such as the executing user's permissions related to the entity. Alternatively, a route might automatically generate default child entities following the creation of a parent object. Consequently, the route event encapsulates a unified dataset encompassing both the parent and its children, in contrast to individual events triggered for each entity created. Therefore, subscribing to route events can offer a richer, more contextually relevant set of information aligned with business logic.

The payload of a route event mirrors the REST response JSON of the route, providing a direct and comprehensive reflection of the data and metadata communicated to the client. This ensures that subscribers to route events receive a payload that encapsulates both the primary data involved and any additional information deemed significant at the business level, facilitating a deeper understanding and integration of the service's functional outcomes.

## Route Event reportrequest-created

**Event topic** : `salesai1-reporting-service-reportrequest-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `reportRequest` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`reportRequest`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "reportRequest",
  "action": "create",
  "appVersion": "Version",
  "rowCount": 1,
  "reportRequest": { "id": "ID", "isActive": true }
}
```

## Route Event reportrequest-updated

**Event topic** : `salesai1-reporting-service-reportrequest-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `reportRequest` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`reportRequest`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "reportRequest",
  "action": "update",
  "appVersion": "Version",
  "rowCount": 1,
  "reportRequest": { "id": "ID", "isActive": true }
}
```

## Route Event reportrequest-deleted

**Event topic** : `salesai1-reporting-service-reportrequest-deleted`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `reportRequest` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`reportRequest`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "reportRequest",
  "action": "delete",
  "appVersion": "Version",
  "rowCount": 1,
  "reportRequest": { "id": "ID", "isActive": false }
}
```

## Route Event reportfile-created

**Event topic** : `salesai1-reporting-service-reportfile-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `reportFile` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`reportFile`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "reportFile",
  "action": "create",
  "appVersion": "Version",
  "rowCount": 1,
  "reportFile": { "id": "ID", "isActive": true }
}
```

## Route Event reportfile-updated

**Event topic** : `salesai1-reporting-service-reportfile-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `reportFile` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`reportFile`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "reportFile",
  "action": "update",
  "appVersion": "Version",
  "rowCount": 1,
  "reportFile": { "id": "ID", "isActive": true }
}
```

## Route Event reportfile-deleted

**Event topic** : `salesai1-reporting-service-reportfile-deleted`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `reportFile` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`reportFile`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "reportFile",
  "action": "delete",
  "appVersion": "Version",
  "rowCount": 1,
  "reportFile": { "id": "ID", "isActive": false }
}
```

## Route Event reportpolicy-created

**Event topic** : `salesai1-reporting-service-reportpolicy-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `reportPolicy` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`reportPolicy`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "reportPolicy",
  "action": "create",
  "appVersion": "Version",
  "rowCount": 1,
  "reportPolicy": { "id": "ID", "isActive": true }
}
```

## Route Event reportpolicy-updated

**Event topic** : `salesai1-reporting-service-reportpolicy-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `reportPolicy` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`reportPolicy`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "reportPolicy",
  "action": "update",
  "appVersion": "Version",
  "rowCount": 1,
  "reportPolicy": { "id": "ID", "isActive": true }
}
```

## Route Event reportpolicy-deleted

**Event topic** : `salesai1-reporting-service-reportpolicy-deleted`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `reportPolicy` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`reportPolicy`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "reportPolicy",
  "action": "delete",
  "appVersion": "Version",
  "rowCount": 1,
  "reportPolicy": { "id": "ID", "isActive": false }
}
```

## Index Event reportfile-created

**Event topic**: `elastic-index-salesai_reportfile-created`

**Event payload**:

```json
{
  "id": "ID",
  "_owner": "ID",
  "reportRequestId": "ID",
  "fileUrl": "String",
  "format": "Enum",
  "format_": "String",
  "signedUrl": "String",
  "signedUrlExpiry": "Date",
  "downloadCount": "Integer",
  "isActive": true,
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Index Event reportfile-updated

**Event topic**: `elastic-index-salesai_reportfile-created`

**Event payload**:

```json
{
  "id": "ID",
  "_owner": "ID",
  "reportRequestId": "ID",
  "fileUrl": "String",
  "format": "Enum",
  "format_": "String",
  "signedUrl": "String",
  "signedUrlExpiry": "Date",
  "downloadCount": "Integer",
  "isActive": true,
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Index Event reportfile-deleted

**Event topic**: `elastic-index-salesai_reportfile-deleted`

**Event payload**:

```json
{
  "id": "ID",
  "_owner": "ID",
  "reportRequestId": "ID",
  "fileUrl": "String",
  "format": "Enum",
  "format_": "String",
  "signedUrl": "String",
  "signedUrlExpiry": "Date",
  "downloadCount": "Integer",
  "isActive": true,
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Index Event reportfile-extended

**Event topic**: `elastic-index-salesai_reportfile-extended`

**Event payload**:

```js
{
  id: id,
  extends: {
    [extendName]: "Object",
    [extendName + "_count"]: "Number",
  },
}
```

# Route Events

Route events are emitted following the successful execution of a route. While most routes perform CRUD (Create, Read, Update, Delete) operations on data objects, resulting in route events that closely resemble database events, there are distinctions worth noting. A single route execution might trigger multiple CRUD actions and ElasticSearch indexing operations. However, for those primarily concerned with the overarching business logic and its outcomes, listening to the consolidated route event, published once at the conclusion of the route's execution, is more pertinent.

Moreover, routes often deliver aggregated data beyond the primary database object, catering to specific client needs. For instance, creating a data object via a route might not only return the entity's data but also route-specific metrics, such as the executing user's permissions related to the entity. Alternatively, a route might automatically generate default child entities following the creation of a parent object. Consequently, the route event encapsulates a unified dataset encompassing both the parent and its children, in contrast to individual events triggered for each entity created. Therefore, subscribing to route events can offer a richer, more contextually relevant set of information aligned with business logic.

The payload of a route event mirrors the REST response JSON of the route, providing a direct and comprehensive reflection of the data and metadata communicated to the client. This ensures that subscribers to route events receive a payload that encapsulates both the primary data involved and any additional information deemed significant at the business level, facilitating a deeper understanding and integration of the service's functional outcomes.

## Route Event reportrequest-created

**Event topic** : `salesai1-reporting-service-reportrequest-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `reportRequest` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`reportRequest`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "reportRequest",
  "action": "create",
  "appVersion": "Version",
  "rowCount": 1,
  "reportRequest": { "id": "ID", "isActive": true }
}
```

## Route Event reportrequest-updated

**Event topic** : `salesai1-reporting-service-reportrequest-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `reportRequest` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`reportRequest`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "reportRequest",
  "action": "update",
  "appVersion": "Version",
  "rowCount": 1,
  "reportRequest": { "id": "ID", "isActive": true }
}
```

## Route Event reportrequest-deleted

**Event topic** : `salesai1-reporting-service-reportrequest-deleted`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `reportRequest` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`reportRequest`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "reportRequest",
  "action": "delete",
  "appVersion": "Version",
  "rowCount": 1,
  "reportRequest": { "id": "ID", "isActive": false }
}
```

## Route Event reportfile-created

**Event topic** : `salesai1-reporting-service-reportfile-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `reportFile` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`reportFile`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "reportFile",
  "action": "create",
  "appVersion": "Version",
  "rowCount": 1,
  "reportFile": { "id": "ID", "isActive": true }
}
```

## Route Event reportfile-updated

**Event topic** : `salesai1-reporting-service-reportfile-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `reportFile` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`reportFile`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "reportFile",
  "action": "update",
  "appVersion": "Version",
  "rowCount": 1,
  "reportFile": { "id": "ID", "isActive": true }
}
```

## Route Event reportfile-deleted

**Event topic** : `salesai1-reporting-service-reportfile-deleted`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `reportFile` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`reportFile`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "reportFile",
  "action": "delete",
  "appVersion": "Version",
  "rowCount": 1,
  "reportFile": { "id": "ID", "isActive": false }
}
```

## Route Event reportpolicy-created

**Event topic** : `salesai1-reporting-service-reportpolicy-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `reportPolicy` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`reportPolicy`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "reportPolicy",
  "action": "create",
  "appVersion": "Version",
  "rowCount": 1,
  "reportPolicy": { "id": "ID", "isActive": true }
}
```

## Route Event reportpolicy-updated

**Event topic** : `salesai1-reporting-service-reportpolicy-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `reportPolicy` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`reportPolicy`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "reportPolicy",
  "action": "update",
  "appVersion": "Version",
  "rowCount": 1,
  "reportPolicy": { "id": "ID", "isActive": true }
}
```

## Route Event reportpolicy-deleted

**Event topic** : `salesai1-reporting-service-reportpolicy-deleted`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `reportPolicy` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`reportPolicy`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "reportPolicy",
  "action": "delete",
  "appVersion": "Version",
  "rowCount": 1,
  "reportPolicy": { "id": "ID", "isActive": false }
}
```

## Index Event reportpolicy-created

**Event topic**: `elastic-index-salesai_reportpolicy-created`

**Event payload**:

```json
{
  "id": "ID",
  "_owner": "ID",
  "reportType": "Enum",
  "reportType_": "String",
  "maxRetentionDays": "Integer",
  "allowedFormats": "Enum",
  "allowedFormats_": "String",
  "description": "Text",
  "isActive": true,
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Index Event reportpolicy-updated

**Event topic**: `elastic-index-salesai_reportpolicy-created`

**Event payload**:

```json
{
  "id": "ID",
  "_owner": "ID",
  "reportType": "Enum",
  "reportType_": "String",
  "maxRetentionDays": "Integer",
  "allowedFormats": "Enum",
  "allowedFormats_": "String",
  "description": "Text",
  "isActive": true,
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Index Event reportpolicy-deleted

**Event topic**: `elastic-index-salesai_reportpolicy-deleted`

**Event payload**:

```json
{
  "id": "ID",
  "_owner": "ID",
  "reportType": "Enum",
  "reportType_": "String",
  "maxRetentionDays": "Integer",
  "allowedFormats": "Enum",
  "allowedFormats_": "String",
  "description": "Text",
  "isActive": true,
  "recordVersion": "Integer",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Index Event reportpolicy-extended

**Event topic**: `elastic-index-salesai_reportpolicy-extended`

**Event payload**:

```js
{
  id: id,
  extends: {
    [extendName]: "Object",
    [extendName + "_count"]: "Number",
  },
}
```

# Route Events

Route events are emitted following the successful execution of a route. While most routes perform CRUD (Create, Read, Update, Delete) operations on data objects, resulting in route events that closely resemble database events, there are distinctions worth noting. A single route execution might trigger multiple CRUD actions and ElasticSearch indexing operations. However, for those primarily concerned with the overarching business logic and its outcomes, listening to the consolidated route event, published once at the conclusion of the route's execution, is more pertinent.

Moreover, routes often deliver aggregated data beyond the primary database object, catering to specific client needs. For instance, creating a data object via a route might not only return the entity's data but also route-specific metrics, such as the executing user's permissions related to the entity. Alternatively, a route might automatically generate default child entities following the creation of a parent object. Consequently, the route event encapsulates a unified dataset encompassing both the parent and its children, in contrast to individual events triggered for each entity created. Therefore, subscribing to route events can offer a richer, more contextually relevant set of information aligned with business logic.

The payload of a route event mirrors the REST response JSON of the route, providing a direct and comprehensive reflection of the data and metadata communicated to the client. This ensures that subscribers to route events receive a payload that encapsulates both the primary data involved and any additional information deemed significant at the business level, facilitating a deeper understanding and integration of the service's functional outcomes.

## Route Event reportrequest-created

**Event topic** : `salesai1-reporting-service-reportrequest-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `reportRequest` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`reportRequest`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "reportRequest",
  "action": "create",
  "appVersion": "Version",
  "rowCount": 1,
  "reportRequest": { "id": "ID", "isActive": true }
}
```

## Route Event reportrequest-updated

**Event topic** : `salesai1-reporting-service-reportrequest-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `reportRequest` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`reportRequest`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "reportRequest",
  "action": "update",
  "appVersion": "Version",
  "rowCount": 1,
  "reportRequest": { "id": "ID", "isActive": true }
}
```

## Route Event reportrequest-deleted

**Event topic** : `salesai1-reporting-service-reportrequest-deleted`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `reportRequest` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`reportRequest`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "reportRequest",
  "action": "delete",
  "appVersion": "Version",
  "rowCount": 1,
  "reportRequest": { "id": "ID", "isActive": false }
}
```

## Route Event reportfile-created

**Event topic** : `salesai1-reporting-service-reportfile-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `reportFile` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`reportFile`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "reportFile",
  "action": "create",
  "appVersion": "Version",
  "rowCount": 1,
  "reportFile": { "id": "ID", "isActive": true }
}
```

## Route Event reportfile-updated

**Event topic** : `salesai1-reporting-service-reportfile-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `reportFile` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`reportFile`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "reportFile",
  "action": "update",
  "appVersion": "Version",
  "rowCount": 1,
  "reportFile": { "id": "ID", "isActive": true }
}
```

## Route Event reportfile-deleted

**Event topic** : `salesai1-reporting-service-reportfile-deleted`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `reportFile` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`reportFile`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "reportFile",
  "action": "delete",
  "appVersion": "Version",
  "rowCount": 1,
  "reportFile": { "id": "ID", "isActive": false }
}
```

## Route Event reportpolicy-created

**Event topic** : `salesai1-reporting-service-reportpolicy-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `reportPolicy` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`reportPolicy`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "reportPolicy",
  "action": "create",
  "appVersion": "Version",
  "rowCount": 1,
  "reportPolicy": { "id": "ID", "isActive": true }
}
```

## Route Event reportpolicy-updated

**Event topic** : `salesai1-reporting-service-reportpolicy-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `reportPolicy` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`reportPolicy`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "reportPolicy",
  "action": "update",
  "appVersion": "Version",
  "rowCount": 1,
  "reportPolicy": { "id": "ID", "isActive": true }
}
```

## Route Event reportpolicy-deleted

**Event topic** : `salesai1-reporting-service-reportpolicy-deleted`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `reportPolicy` data object itself.

The following JSON included in the payload illustrates the fullest representation of the **`reportPolicy`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{
  "status": "OK",
  "statusCode": "200",
  "elapsedMs": 126,
  "ssoTime": 120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName": "reportPolicy",
  "action": "delete",
  "appVersion": "Version",
  "rowCount": 1,
  "reportPolicy": { "id": "ID", "isActive": false }
}
```

# Copyright

All sources, documents and other digital materials are copyright of .

# About Us

For more information please visit our website: .

.
.
