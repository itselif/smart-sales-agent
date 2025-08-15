# REST API GUIDE

## NOTIFICATION SERVICE

The Notification service is a microservice that allows sending notifications through SMS, Email, and Push channels. Providers can be configured dynamically through the `.env` file.

## Architectural Design Credit and Contact Information

The architectural design of this microservice is credited to.  
For inquiries, feedback, or further information regarding the architecture, please direct your communication to:

**Email**:

We encourage open communication and welcome any questions or discussions related to the architectural aspects of this microservice.

## Documentation Scope

Welcome to the official documentation for the Notification Service REST API. This document provides a comprehensive overview of the available endpoints, how they work, and how to use them efficiently.

**Intended Audience**  
This documentation is intended for developers, architects, and system administrators involved in the design, implementation, and maintenance of the Notification Service. It assumes familiarity with microservices architecture and RESTful APIs.

**Overview**

Within these pages, you will find detailed information on how to effectively utilize the REST API, including authentication methods, request and response formats, endpoint descriptions, and examples of common use cases.

**Beyond REST**  
It's important to note that the Notification Service also supports alternative methods of interaction, such as messaging via a Kafka message broker. These communication methods are beyond the scope of this document. For information regarding these protocols, please refer to their respective documentation.

---

## Routes

### Route: Register Device

_Route Definition_: Registers a device for a user.  
_Route Type_: create  
_Default access route_: _POST_ `/devices/register`

### Parameters

| Parameter | Type   | Required | Population |
| --------- | ------ | -------- | ---------- |
| device    | Object | Yes      | body       |
| userId    | ID     | Yes      | req.userId |

```js
axios({
  method: "POST",
  url: `/devices/register`,
  data: {
    device: "Object",
  },
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. Any validation errors will return status code `400` with an error message.

### Route: Unregister Device

_Route Definition_: Removes a registered device.  
_Route Type_: delete  
_Default access route_: _DELETE_ `/devices/unregister/:deviceId`

### Parameters

| Parameter | Type | Required | Population |
| --------- | ---- | -------- | ---------- |
| deviceId  | ID   | Yes      | path.param |
| userId    | ID   | Yes      | req.userId |

```js
axios({
  method: "DELETE",
  url: `/devices/unregister/${deviceId}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. Any validation errors will return status code `400` with an error message.

### Route: Get Notifications

_Route Definition_: Retrieves a paginated list of notifications.  
_Route Type_: get  
_Default access route_: _GET_ `/notifications`

### Parameters

| Parameter | Type   | Required | Population   |
| --------- | ------ | -------- | ------------ |
| page      | Number | No       | query.page   |
| limit     | Number | No       | query.limit  |
| sortBy    | String | No       | query.sortBy |
| userId    | ID     | Yes      | req.userId   |

```js
axios({
  method: "GET",
  url: `/notifications`,
  data: {},
  params: {
    page: "Number",
    limit: "Number",
    sortBy: "String",
  },
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. Any validation errors will return status code `400` with an error message.

### Route: Send Notification

_Route Definition_: Sends a notification to specified recipients.  
_Route Type_: create  
_Default access route_: _POST_ `/notifications`

### Parameters

| Parameter    | Type   | Required | Population |
| ------------ | ------ | -------- | ---------- |
| notification | Object | Yes      | body       |

```js
axios({
  method: "POST",
  url: `/notifications`,
  data: {
    notification: "Object",
  },
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. Any validation errors will return status code `400` with an error message.

### Route: Mark Notifications as Seen

_Route Definition_: Marks selected notifications as seen.  
_Route Type_: update  
_Default access route_: _POST_ `/notifications/seen`

### Parameters

| Parameter       | Type  | Required | Population |
| --------------- | ----- | -------- | ---------- |
| notificationIds | Array | Yes      | body       |
| userId          | ID    | Yes      | req.userId |

```js
axios({
  method: "POST",
  url: `/notifications/seen`,
  data: {
    notificationIds: "Object",
  },
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. Any validation errors will return status code `400` with an error message.

---
