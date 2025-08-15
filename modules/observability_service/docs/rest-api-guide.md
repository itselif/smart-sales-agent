# REST API GUIDE

## salesai-observability-service

Collects, indexes, and returns audit logs for all sensitive actions and system metrics, supporting audit trail retrieval by user, store, action, or time. Stores and serves system/business metrics, exposes endpoints for audit export, anomaly events, and notification flows.

## Architectural Design Credit and Contact Information

The architectural design of this microservice is credited to .
For inquiries, feedback, or further information regarding the architecture, please direct your communication to:

Email:

We encourage open communication and welcome any questions or discussions related to the architectural aspects of this microservice.

## Documentation Scope

Welcome to the official documentation for the Observability Service's REST API. This document is designed to provide a comprehensive guide to interfacing with our Observability Service exclusively through RESTful API endpoints.

**Intended Audience**

This documentation is intended for developers and integrators who are looking to interact with the Observability Service via HTTP requests for purposes such as creating, updating, deleting and querying Observability objects.

**Overview**

Within these pages, you will find detailed information on how to effectively utilize the REST API, including authentication methods, request and response formats, endpoint descriptions, and examples of common use cases.

Beyond REST
It's important to note that the Observability Service also supports alternative methods of interaction, such as gRPC and messaging via a Message Broker. These communication methods are beyond the scope of this document. For information regarding these protocols, please refer to their respective documentation.

## Authentication And Authorization

To ensure secure access to the Observability service's protected endpoints, a project-wide access token is required. This token serves as the primary method for authenticating requests to our service. However, it's important to note that access control varies across different routes:

**Protected Routes**:
Certain routes require specific authorization levels. Access to these routes is contingent upon the possession of a valid access token that meets the route-specific authorization criteria. Unauthorized requests to these routes will be rejected.

**Public Routes**:
The service also includes routes that are accessible without authentication. These public endpoints are designed for open access and do not require an access token.

### Token Locations

When including your access token in a request, ensure it is placed in one of the following specified locations. The service will sequentially search these locations for the token, utilizing the first one it encounters.

| Location             | Token Name / Param Name               |
| -------------------- | ------------------------------------- |
| Query                | access_token                          |
| Authorization Header | Bearer                                |
| Header               | salesai1-access-token                 |
| Header               | salesai1-access-token-{storeCodename} |
| Cookie               | salesai1-access-token-{storeCodename} |

Please ensure the token is correctly placed in one of these locations, using the appropriate label as indicated. The service prioritizes these locations in the order listed, processing the first token it successfully identifies.

## Api Definitions

This section outlines the API endpoints available within the Observability service. Each endpoint can receive parameters through various methods, meticulously described in the following definitions. It's important to understand the flexibility in how parameters can be included in requests to effectively interact with the Observability service.

This service is configured to listen for HTTP requests on port `3004`,
serving both the main API interface and default administrative endpoints.

The following routes are available by default:

- **API Test Interface (API Face):** `/`
- **Swagger Documentation:** `/swagger`
- **Postman Collection Download:** `/getPostmanCollection`
- **Health Checks:** `/health` and `/admin/health`
- **Current Session Info:** `/currentuser`
- **Favicon:** `/favicon.ico`

This service is accessible via the following environment-specific URLs:

- **Preview:** `https://observability-api-salesai1.prw.mindbricks.com`
- **Staging:** `https://observability-api-salesai1.staging.mindbricks.com`
- **Production:** `https://observability-api-salesai1.prod.mindbricks.com`

**Parameter Inclusion Methods:**
Parameters can be incorporated into API requests in several ways, each with its designated location. Understanding these methods is crucial for correctly constructing your requests:

**Query Parameters:** Included directly in the URL's query string.

**Path Parameters:** Embedded within the URL's path.

**Body Parameters:** Sent within the JSON body of the request.

**Session Parameters:** Automatically read from the session object. This method is used for parameters that are intrinsic to the user's session, such as userId. When using an API that involves session parameters, you can omit these from your request. The service will automatically bind them to the route, provided that a session is associated with your request.

**Note on Session Parameters:**
Session parameters represent a unique method of parameter inclusion, relying on the context of the user's session. A common example of a session parameter is userId, which the service automatically associates with your request when a session exists. This feature ensures seamless integration of user-specific data without manual input for each request.

By adhering to the specified parameter inclusion methods, you can effectively utilize the Observability service's API endpoints. For detailed information on each endpoint, including required parameters and their accepted locations, refer to the individual API definitions below.

### Common Parameters

The `Observability` service's routes support several common parameters designed to modify and enhance the behavior of API requests. These parameters are not individually listed in the API route definitions to avoid repetition. Instead, refer to this section to understand how to leverage these common behaviors across different routes. Note that all common parameters should be included in the query part of the URL.

### Supported Common Parameters:

- **getJoins (BOOLEAN)**: Controls whether to retrieve associated objects along with the main object. By default, `getJoins` is assumed to be `true`. Set it to `false` if you prefer to receive only the main fields of an object, excluding its associations.

- **excludeCQRS (BOOLEAN)**: Applicable only when `getJoins` is `true`. By default, `excludeCQRS` is set to `false`. Enabling this parameter (`true`) omits non-local associations, which are typically more resource-intensive as they require querying external services like ElasticSearch for additional information. Use this to optimize response times and resource usage.

- **requestId (String)**: Identifies a request to enable tracking through the service's log chain. A random hex string of 32 characters is assigned by default. If you wish to use a custom `requestId`, simply include it in your query parameters.

- **caching (BOOLEAN)**: Determines the use of caching for query routes. By default, caching is enabled (`true`). To ensure the freshest data directly from the database, set this parameter to `false`, bypassing the cache.

- **cacheTTL (Integer)**: Specifies the Time-To-Live (TTL) for query caching, in seconds. This is particularly useful for adjusting the default caching duration (5 minutes) for `get list` queries. Setting a custom `cacheTTL` allows you to fine-tune the cache lifespan to meet your needs.

- **pageNumber (Integer)**: For paginated `get list` routes, this parameter selects which page of results to retrieve. The default is `1`, indicating the first page. To disable pagination and retrieve all results, set `pageNumber` to `0`.

- **pageRowCount (Integer)**: In conjunction with paginated routes, this parameter defines the number of records per page. The default value is `25`. Adjusting `pageRowCount` allows you to control the volume of data returned in a single request.

By utilizing these common parameters, you can tailor the behavior of API requests to suit your specific requirements, ensuring optimal performance and usability of the `Observability` service.

### Multi Tenant Architecture

The `Observability` service operates within a multi tenant architecture.
The service is designed to support multiple tenants, each with its distinct data and configuration. This architecture ensures that data is securely isolated between tenants, preventing unauthorized access and maintaining data integrity.
The service tenant is called `store` and identified as `storeId`.
Other than platform users like superAdmin, saasAdmin and saasUser that belong to the root tenant, the tenant creators(owners) and users will all be associated with an store tenant.
When users login their scope will be isolated only to include one tenant data they below. So user may acces only this logined tennat through out the session. After loging in to e specific tenant, users should include the tenant id in their request to access the tenant data. In each request they may access different tenant data if they belong them.

#### Key Points:

- **Tenant-Specific Requests**: It is imperative that each request specifies the tenant it pertains to. This is crucial because most routes are designed to interact exclusively with objects that are part of the specified tenant sandbox.
- **User Distinction**: The requesting user must have a registration for that tenant. The service searches for a `store` specific token (cookie or bearer) using the provided `store`Id in the request header. Note that to be able to login and use multiple tenant's sites a user must register for them all.
- **Request Header Parameter**: When making a request, include the desired `storeId` in the request header using the parameter name ``. This signals to the service which domain context to apply for the request processing. Alternatively, you can include the tenant id in the query parameters with the name `storeId`.
- **Root Tenant**: As all multi tenant architectures this application also has a default root tenant which created automatically. If there is no tenant mark for the request, the request are assumed as to the root tenant. Root tenant is also the hub for registering tenant creating and their owner users. When users register themselves in the root tenant, an (store) will alos be created with the given data in the request body and the user will be asssociated with this new tenant record as the `tenantAdmin`.
- **Superadmin account**: A super admin account is created with the given credentials in the design so that there is an absolute user which has all rights in the root tenant and other tenants. This account is used to create and manage all other tenants in the system.
  - **Tenant Registration**: The `Observability` service allows for the creation of new tenants only through admin account of the root tenant. So if a new store record is needed, the superadmin or admin roles of the root should create then new tenant and assign any user as the owner of it.

#### Implementation:

When the user logins there may be few ways for Mindbricks to recognize and set the tenant id in the session.

1. Mindbricks will check the url of the login request if it matches tenant url.
2. Mindbricks will check the `` has the tenant id.
3. Mindbricks will check if the user is associated with a `store` in the data model.
   After you login a tenant successfully, ensure that your requests accurately target objects that fall within the tenant scope set during the login session.
   Ensure your requests are correctly formatted to include the domain sandbox information in the header. This enables the `Observability` service to accurately identify the domain context, facilitating proper access control and data management based on the user's permissions and the specified domain.

```js
axios({
  method: 'GET',
  headers: {
    '': 'Your-storeId-here'
  }
  url: "/someroutepath",
  data: {
    "someData":"someData"
  },
  params: {
    "aParam":"aParam"
  }
});
```

By adhering to this domain sandbox model, the `Observability` service maintains a secure and organized structure for handling requests across different domains, ensuring that operations are performed within the correct contextual boundaries.

### Error Response

If a request encounters an issue, whether due to a logical fault or a technical problem, the service responds with a standardized JSON error structure. The HTTP status code within this response indicates the nature of the error, utilizing commonly recognized codes for clarity:

- **400 Bad Request**: The request was improperly formatted or contained invalid parameters, preventing the server from processing it.
- **401 Unauthorized**: The request lacked valid authentication credentials or the credentials provided do not grant access to the requested resource.
- **404 Not Found**: The requested resource was not found on the server.
- **500 Internal Server Error**: The server encountered an unexpected condition that prevented it from fulfilling the request.

Each error response is structured to provide meaningful insight into the problem, assisting in diagnosing and resolving issues efficiently.

```js
{
  "result": "ERR",
  "status": 400,
  "message": "errMsg_organizationIdisNotAValidID",
  "errCode": 400,
  "date": "2024-03-19T12:13:54.124Z",
  "detail": "String"
}
```

### Object Structure of a Successfull Response

When the `Observability` service processes requests successfully, it wraps the requested resource(s) within a JSON envelope. This envelope not only contains the data but also includes essential metadata, such as configuration details and pagination information, to enrich the response and provide context to the client.

**Key Characteristics of the Response Envelope:**

- **Data Presentation**: Depending on the nature of the request, the service returns either a single data object or an array of objects encapsulated within the JSON envelope.
  - **Creation and Update Routes**: These routes return the unmodified (pure) form of the data object(s), without any associations to other data objects.
  - **Delete Routes**: Even though the data is removed from the database, the last known state of the data object(s) is returned in its pure form.
  - **Get Requests**: A single data object is returned in JSON format.
  - **Get List Requests**: An array of data objects is provided, reflecting a collection of resources.

- **Data Structure and Joins**: The complexity of the data structure in the response can vary based on the route's architectural design and the join options specified in the request. The architecture might inherently limit join operations, or they might be dynamically controlled through query parameters.
  - **Pure Data Forms**: In some cases, the response mirrors the exact structure found in the primary data table, without extensions.
  - **Extended Data Forms**: Alternatively, responses might include data extended through joins with tables within the same service or aggregated from external sources, such as ElasticSearch indices related to other services.
  - **Join Varieties**: The extensions might involve one-to-one joins, resulting in single object associations, or one-to-many joins, leading to an array of objects. In certain instances, the data might even feature nested inclusions from other data objects.

**Design Considerations**: The structure of a route's response data is meticulously crafted during the service's architectural planning. This design ensures that responses adequately reflect the intended data relationships and service logic, providing clients with rich and meaningful information.

**Brief Data**: Certain routes return a condensed version of the object data, intentionally selecting only specific fields deemed useful for that request. In such instances, the route documentation will detail the properties included in the response, guiding developers on what to expect.

### API Response Structure

The API utilizes a standardized JSON envelope to encapsulate responses. This envelope is designed to consistently deliver both the requested data and essential metadata, ensuring that clients can efficiently interpret and utilize the response.

**HTTP Status Codes:**

- **200 OK**: This status code is returned for successful GET, GETLIST, UPDATE, or DELETE operations, indicating that the request has been processed successfully.
- **201 Created**: This status code is specific to CREATE operations, signifying that the requested resource has been successfully created.

**Success Response Format:**

For successful operations, the response includes a `"status": "OK"` property, signaling the successful execution of the request. The structure of a successful response is outlined below:

```json
{
  "status":"OK",
  "statusCode": 200,
  "elapsedMs":126,
  "ssoTime":120,
  "source": "db",
  "cacheKey": "hexCode",
  "userId": "ID",
  "sessionId": "ID",
  "requestId": "ID",
  "dataName":"products",
  "method":"GET",
  "action":"getList",
  "appVersion":"Version",
  "rowCount":3
  "products":[{},{},{}],
  "paging": {
    "pageNumber":1,
    "pageRowCount":25,
    "totalRowCount":3,
    "pageCount":1
  },
  "filters": [],
  "uiPermissions": []
}
```

- **`products`**: In this example, this key contains the actual response content, which may be a single object or an array of objects depending on the operation performed.

**Handling Errors:**

For details on handling error scenarios and understanding the structure of error responses, please refer to the "Error Response" section provided earlier in this documentation. It outlines how error conditions are communicated, including the use of HTTP status codes and standardized JSON structures for error messages.

**Route Validation Layers:**

Route Validations may be executed in 4 different layers. The layer is a kind of time definition in the route life cycle. Note that while conditional check times are defined by layers, the fetch actions are defined by access times.

`layer1`: "The first layer of route life cycle which is just after the request parameters are validated and the request is in controller. Any script, validation or data operation in this layer can access the route parameters only. The beforeInstance data is not ready yet."

`layer2`: "The second layer of route life cycle which is just after beforeInstance data is collected before the main operation of the route and the main operation is not started yet. In this layer the collected supplementary data is accessable with the route parameters."

`layer3`: "The third layer of route life cycle which is just after the main operation of the route is completed. In this layer the main operation result is accessable with the beforeInstance data and route parameters. Note that the afterInstance data is not ready yet."

`layer4`: "The last layer of route life cycle which is just after afterInstance supplementary data is collected. In this layer the afterInstance data is accessable with the main operation result, beforeInstance data and route parameters."

## Resources

Observability service provides the following resources which are stored in its own database as a data object. Note that a resource for an api access is a data object for the service.

### AuditLog resource

_Resource Definition_ : Tracks every sensitive or critical action on the platform for audit/compliance. Includes what happened, who, when, entity, before/after data, store and user context, and extra trace fields.
_AuditLog Resource Properties_
| Name | Type | Required | Default | Definition |
| ---- | ---- | -------- | ------- | ---------- |
| **userId** | ID | | | _User who triggered the event/action being logged._ |
| **actionType** | String | | | _Categorical action descriptor (e.g., saleEdit, overrideGrant, reportDownload, adminOp, login, healthCheck, seedInject, repoSwitch, etc.)._ |
| **entityType** | String | | | _Type of primary entity affected (e.g., saleTransaction, inventoryItem, reportFile, storeAssignment, seedData, metric, etc.)._ |
| **entityId** | String | | | _ID of the primary entity affected._ |
| **beforeData** | Object | | | _Snapshot of relevant data before the action/change. (deep copy/structure as needed)._ |
| **afterData** | Object | | | _Snapshot of data as it was after this action/change, if applicable._ |
| **severity** | Enum | | | _Severity/level of action event: 0=info, 1=warning, 2=critical._ |
| **message** | Text | | | _Human-readable text or trace providing context/description of the action._ |
| **traceContext** | Object | | | _Flexible object: request IDs, IPs, client/user-agent, trace IDs, or extra structured context for compliance and troubleshooting._ |
| **storeId** | ID | | | _An ID value to represent the tenant id of the store_ |

#### Enum Properties

Enum properties are represented as Small Integer values (0-255) in the database. The values are mapped to their corresponding names in the application layer.

##### severity Enum Property

_Enum Options_
| Name | Value | Index |
| ---- | ----- | ----- |
| **info** | `"info""` | 0 |
| **warning** | `"warning""` | 1 |
| **critical** | `"critical""` | 2 |

### MetricDatapoint resource

_Resource Definition_ : Stores a single time-series business/system/platform metric (e.g., salesCount, errorRate, latency), with target entity, granularity, observed value, and anomaly flags.
_MetricDatapoint Resource Properties_
| Name | Type | Required | Default | Definition |
| ---- | ---- | -------- | ------- | ---------- |
| **metricType** | String | | | _Type of metric (e.g., salesCount, inventoryLow, systemLatency, apiError, healthCheck, loginCount)_ |
| **targetType** | String | | | _Type of target: system, service, store, user, etc._ |
| **targetId** | String | | | _ID of the target (storeId, service name, userId, etc.) as appropriate._ |
| **periodStart** | Date | | | _Start timestamp for the metric period (e.g. day, hour, minute, etc.)._ |
| **granularity** | String | | | _Granularity/resolution of the datapoint (minute/hour/day/etc)._ |
| **value** | Double | | | _Value of the metric datapoint._ |
| **flagAnomalous** | Boolean | | | _Indicates the datapoint is an anomaly (detected or flagged)._ |
| **observedByUserId** | ID | | | _User who reported/flagged/created this metric data, if manually added or updated (optional)._ |
| **context** | Object | | | _Free-form context for the metric (cause, dimension, tags, error codes, etc.)_ |

### AnomalyEvent resource

_Resource Definition_ : Represents a detected or reported anomaly (e.g., suspicious, failed or policy-violating activity) for compliance/investigation. Tracks type, source, severity, and review status.
_AnomalyEvent Resource Properties_
| Name | Type | Required | Default | Definition |
| ---- | ---- | -------- | ------- | ---------- |
| **anomalyType** | String | | | _Type of anomaly (e.g., dataTamper, suspiciousEdit, fraud, systemFailure, policyBreach, invalidLogin, reportAbuse, etc.)_ |
| **triggeredByUserId** | ID | | | _User who reported or triggered the anomaly, if any._ |
| **affectedUserId** | ID | | | _User affected by anomaly (if different from trigger)._ |
| **storeId** | ID | | | _Store linked to the anomaly, if relevant._ |
| **relatedEntityType** | String | | | _Type of related entity (metric, auditLog, saleTransaction, etc.), if anomaly links to another record._ |
| **relatedEntityId** | String | | | _ID of related entity record._ |
| **description** | Text | | | _Description/details regarding the anomaly for compliance, notification, and investigation._ |
| **detectedAt** | Date | | | _Date/time anomaly was detected/flagged._ |
| **severity** | Enum | | | _Severity of anomaly: 0=low, 1=medium, 2=high, 3=critical._ |
| **status** | Enum | | | _Status of event: 0=open, 1=investigating, 2=resolved, 3=closed._ |
| **reviewedByUserId** | ID | | | _User who performed/closed/reviewed the anomaly (e.g., admin or investigator)._ |

#### Enum Properties

Enum properties are represented as Small Integer values (0-255) in the database. The values are mapped to their corresponding names in the application layer.

##### severity Enum Property

_Enum Options_
| Name | Value | Index |
| ---- | ----- | ----- |
| **low** | `"low""` | 0 |
| **medium** | `"medium""` | 1 |
| **high** | `"high""` | 2 |
| **critical** | `"critical""` | 3 |

##### status Enum Property

_Enum Options_
| Name | Value | Index |
| ---- | ----- | ----- |
| **open** | `"open""` | 0 |
| **investigating** | `"investigating""` | 1 |
| **resolved** | `"resolved""` | 2 |
| **closed** | `"closed""` | 3 |

## Crud Routes

### Route: getAuditLog

_Route Definition_ : Get a single audit log entry by ID.

_Route Type_ : get

_Default access route_ : _GET_ `/auditlogs/:auditLogId`

#### Parameters

The getAuditLog api has got 1 parameter

| Parameter  | Type | Required | Population                 |
| ---------- | ---- | -------- | -------------------------- |
| auditLogId | ID   | true     | request.params?.auditLogId |

To access the api you can use the **REST** controller with the path **GET /auditlogs/:auditLogId**

```js
axios({
  method: "GET",
  url: `/auditlogs/${auditLogId}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`auditLog`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "auditLog",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "auditLog": { "id": "ID", "isActive": true }
}
```

### Route: createAuditLog

_Route Definition_ : Record a new audit/event log entry for compliance and traceability.

_Route Type_ : create

_Default access route_ : _POST_ `/auditlogs`

#### Parameters

The createAuditLog api has got 9 parameters

| Parameter    | Type   | Required | Population                 |
| ------------ | ------ | -------- | -------------------------- |
| userId       | ID     | true     | request.body?.userId       |
| actionType   | String | true     | request.body?.actionType   |
| entityType   | String | false    | request.body?.entityType   |
| entityId     | String | false    | request.body?.entityId     |
| beforeData   | Object | false    | request.body?.beforeData   |
| afterData    | Object | false    | request.body?.afterData    |
| severity     | Enum   | true     | request.body?.severity     |
| message      | Text   | false    | request.body?.message      |
| traceContext | Object | false    | request.body?.traceContext |

To access the api you can use the **REST** controller with the path **POST /auditlogs**

```js
axios({
  method: "POST",
  url: "/auditlogs",
  data: {
    userId: "ID",
    actionType: "String",
    entityType: "String",
    entityId: "String",
    beforeData: "Object",
    afterData: "Object",
    severity: "Enum",
    message: "Text",
    traceContext: "Object",
  },
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`auditLog`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "auditLog",
  "action": "create",
  "appVersion": "Version",
  "rowCount": 1,
  "auditLog": { "id": "ID", "isActive": true }
}
```

### Route: updateAuditLog

_Route Definition_ : Update context or message of an audit log entry (rare, restricted).

_Route Type_ : update

_Default access route_ : _PATCH_ `/auditlogs/:auditLogId`

#### Parameters

The updateAuditLog api has got 2 parameters

| Parameter  | Type | Required | Population                 |
| ---------- | ---- | -------- | -------------------------- |
| auditLogId | ID   | true     | request.params?.auditLogId |
| message    | Text | false    | request.body?.message      |

To access the api you can use the **REST** controller with the path **PATCH /auditlogs/:auditLogId**

```js
axios({
  method: "PATCH",
  url: `/auditlogs/${auditLogId}`,
  data: {
    message: "Text",
  },
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`auditLog`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "auditLog",
  "action": "update",
  "appVersion": "Version",
  "rowCount": 1,
  "auditLog": { "id": "ID", "isActive": true }
}
```

### Route: deleteAuditLog

_Route Definition_ : Soft-deletes audit log entry as per retention policy or admin operation.

_Route Type_ : delete

_Default access route_ : _DELETE_ `/auditlogs/:auditLogId`

#### Parameters

The deleteAuditLog api has got 1 parameter

| Parameter  | Type | Required | Population                 |
| ---------- | ---- | -------- | -------------------------- |
| auditLogId | ID   | true     | request.params?.auditLogId |

To access the api you can use the **REST** controller with the path **DELETE /auditlogs/:auditLogId**

```js
axios({
  method: "DELETE",
  url: `/auditlogs/${auditLogId}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`auditLog`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "auditLog",
  "action": "delete",
  "appVersion": "Version",
  "rowCount": 1,
  "auditLog": { "id": "ID", "isActive": false }
}
```

### Route: listAuditLogs

_Route Definition_ : Paginated/filterable query of audit logs by user, store, time, entity, and action for sellers, managers, or admins.

_Route Type_ : getList

_Default access route_ : _GET_ `/auditlogs`

The listAuditLogs api has got no parameters.

To access the api you can use the **REST** controller with the path **GET /auditlogs**

```js
axios({
  method: "GET",
  url: "/auditlogs",
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`auditLogs`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "auditLogs",
  "action": "getList",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "auditLogs": [{ "id": "ID", "isActive": true }, {}, {}],
  "paging": {
    "pageNumber": "Number",
    "pageRowCount": "NUmber",
    "totalRowCount": "Number",
    "pageCount": "Number"
  },
  "filters": [],
  "uiPermissions": []
}
```

### Route: getMetricDatapoint

_Route Definition_ : Get a single metric datapoint entry by ID.

_Route Type_ : get

_Default access route_ : _GET_ `/metricdatapoints/:metricDatapointId`

#### Parameters

The getMetricDatapoint api has got 1 parameter

| Parameter         | Type | Required | Population                        |
| ----------------- | ---- | -------- | --------------------------------- |
| metricDatapointId | ID   | true     | request.params?.metricDatapointId |

To access the api you can use the **REST** controller with the path **GET /metricdatapoints/:metricDatapointId**

```js
axios({
  method: "GET",
  url: `/metricdatapoints/${metricDatapointId}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`metricDatapoint`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "metricDatapoint",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "metricDatapoint": { "id": "ID", "isActive": true }
}
```

### Route: createMetricDatapoint

_Route Definition_ : Record a new system/business metric datapoint.

_Route Type_ : create

_Default access route_ : _POST_ `/metricdatapoints`

#### Parameters

The createMetricDatapoint api has got 9 parameters

| Parameter        | Type    | Required | Population                     |
| ---------------- | ------- | -------- | ------------------------------ |
| metricType       | String  | true     | request.body?.metricType       |
| targetType       | String  | true     | request.body?.targetType       |
| targetId         | String  | false    | request.body?.targetId         |
| periodStart      | Date    | true     | request.body?.periodStart      |
| granularity      | String  | true     | request.body?.granularity      |
| value            | Double  | true     | request.body?.value            |
| flagAnomalous    | Boolean | false    | request.body?.flagAnomalous    |
| observedByUserId | ID      | false    | request.body?.observedByUserId |
| context          | Object  | false    | request.body?.context          |

To access the api you can use the **REST** controller with the path **POST /metricdatapoints**

```js
axios({
  method: "POST",
  url: "/metricdatapoints",
  data: {
    metricType: "String",
    targetType: "String",
    targetId: "String",
    periodStart: "Date",
    granularity: "String",
    value: "Double",
    flagAnomalous: "Boolean",
    observedByUserId: "ID",
    context: "Object",
  },
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`metricDatapoint`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "metricDatapoint",
  "action": "create",
  "appVersion": "Version",
  "rowCount": 1,
  "metricDatapoint": { "id": "ID", "isActive": true }
}
```

### Route: updateMetricDatapoint

_Route Definition_ : Update value/anomaly/context of a metric (used if outlier is found, value is revised, or flagged).

_Route Type_ : update

_Default access route_ : _PATCH_ `/metricdatapoints/:metricDatapointId`

#### Parameters

The updateMetricDatapoint api has got 4 parameters

| Parameter         | Type    | Required | Population                        |
| ----------------- | ------- | -------- | --------------------------------- |
| metricDatapointId | ID      | true     | request.params?.metricDatapointId |
| value             | Double  | false    | request.body?.value               |
| flagAnomalous     | Boolean | false    | request.body?.flagAnomalous       |
| context           | Object  | false    | request.body?.context             |

To access the api you can use the **REST** controller with the path **PATCH /metricdatapoints/:metricDatapointId**

```js
axios({
  method: "PATCH",
  url: `/metricdatapoints/${metricDatapointId}`,
  data: {
    value: "Double",
    flagAnomalous: "Boolean",
    context: "Object",
  },
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`metricDatapoint`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "metricDatapoint",
  "action": "update",
  "appVersion": "Version",
  "rowCount": 1,
  "metricDatapoint": { "id": "ID", "isActive": true }
}
```

### Route: deleteMetricDatapoint

_Route Definition_ : Soft-delete a metric datapoint (e.g., for cleanup, retention, etc).

_Route Type_ : delete

_Default access route_ : _DELETE_ `/metricdatapoints/:metricDatapointId`

#### Parameters

The deleteMetricDatapoint api has got 1 parameter

| Parameter         | Type | Required | Population                        |
| ----------------- | ---- | -------- | --------------------------------- |
| metricDatapointId | ID   | true     | request.params?.metricDatapointId |

To access the api you can use the **REST** controller with the path **DELETE /metricdatapoints/:metricDatapointId**

```js
axios({
  method: "DELETE",
  url: `/metricdatapoints/${metricDatapointId}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`metricDatapoint`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "metricDatapoint",
  "action": "delete",
  "appVersion": "Version",
  "rowCount": 1,
  "metricDatapoint": { "id": "ID", "isActive": false }
}
```

### Route: listMetricDatapoints

_Route Definition_ : Paginated/filterable query of metric datapoints by metric type, target, time, or anomaly flag.

_Route Type_ : getList

_Default access route_ : _GET_ `/metricdatapoints`

The listMetricDatapoints api has got no parameters.

To access the api you can use the **REST** controller with the path **GET /metricdatapoints**

```js
axios({
  method: "GET",
  url: "/metricdatapoints",
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`metricDatapoints`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "metricDatapoints",
  "action": "getList",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "metricDatapoints": [{ "id": "ID", "isActive": true }, {}, {}],
  "paging": {
    "pageNumber": "Number",
    "pageRowCount": "NUmber",
    "totalRowCount": "Number",
    "pageCount": "Number"
  },
  "filters": [],
  "uiPermissions": []
}
```

### Route: getAnomalyEvent

_Route Definition_ : Get a single anomaly event record by ID.

_Route Type_ : get

_Default access route_ : _GET_ `/anomalyevents/:anomalyEventId`

#### Parameters

The getAnomalyEvent api has got 1 parameter

| Parameter      | Type | Required | Population                     |
| -------------- | ---- | -------- | ------------------------------ |
| anomalyEventId | ID   | true     | request.params?.anomalyEventId |

To access the api you can use the **REST** controller with the path **GET /anomalyevents/:anomalyEventId**

```js
axios({
  method: "GET",
  url: `/anomalyevents/${anomalyEventId}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`anomalyEvent`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "anomalyEvent",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "anomalyEvent": { "id": "ID", "isActive": true }
}
```

### Route: createAnomalyEvent

_Route Definition_ : Create and log a new anomaly event for compliance and investigation.

_Route Type_ : create

_Default access route_ : _POST_ `/anomalyevents`

#### Parameters

The createAnomalyEvent api has got 11 parameters

| Parameter         | Type   | Required | Population                      |
| ----------------- | ------ | -------- | ------------------------------- |
| anomalyType       | String | true     | request.body?.anomalyType       |
| triggeredByUserId | ID     | false    | request.body?.triggeredByUserId |
| affectedUserId    | ID     | false    | request.body?.affectedUserId    |
| storeId           | ID     | false    | request.body?.storeId           |
| relatedEntityType | String | false    | request.body?.relatedEntityType |
| relatedEntityId   | String | false    | request.body?.relatedEntityId   |
| description       | Text   | false    | request.body?.description       |
| detectedAt        | Date   | true     | request.body?.detectedAt        |
| severity          | Enum   | true     | request.body?.severity          |
| status            | Enum   | true     | request.body?.status            |
| reviewedByUserId  | ID     | false    | request.body?.reviewedByUserId  |

To access the api you can use the **REST** controller with the path **POST /anomalyevents**

```js
axios({
  method: "POST",
  url: "/anomalyevents",
  data: {
    anomalyType: "String",
    triggeredByUserId: "ID",
    affectedUserId: "ID",
    storeId: "ID",
    relatedEntityType: "String",
    relatedEntityId: "String",
    description: "Text",
    detectedAt: "Date",
    severity: "Enum",
    status: "Enum",
    reviewedByUserId: "ID",
  },
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`anomalyEvent`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "anomalyEvent",
  "action": "create",
  "appVersion": "Version",
  "rowCount": 1,
  "anomalyEvent": { "id": "ID", "isActive": true }
}
```

### Route: updateAnomalyEvent

_Route Definition_ : Update details/review/status for anomaly investigation/closure.

_Route Type_ : update

_Default access route_ : _PATCH_ `/anomalyevents/:anomalyEventId`

#### Parameters

The updateAnomalyEvent api has got 4 parameters

| Parameter        | Type | Required | Population                     |
| ---------------- | ---- | -------- | ------------------------------ |
| anomalyEventId   | ID   | true     | request.params?.anomalyEventId |
| description      | Text | false    | request.body?.description      |
| status           | Enum | false    | request.body?.status           |
| reviewedByUserId | ID   | false    | request.body?.reviewedByUserId |

To access the api you can use the **REST** controller with the path **PATCH /anomalyevents/:anomalyEventId**

```js
axios({
  method: "PATCH",
  url: `/anomalyevents/${anomalyEventId}`,
  data: {
    description: "Text",
    status: "Enum",
    reviewedByUserId: "ID",
  },
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`anomalyEvent`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "anomalyEvent",
  "action": "update",
  "appVersion": "Version",
  "rowCount": 1,
  "anomalyEvent": { "id": "ID", "isActive": true }
}
```

### Route: deleteAnomalyEvent

_Route Definition_ : Soft-delete anomaly investigation record upon admin/policy closure.

_Route Type_ : delete

_Default access route_ : _DELETE_ `/anomalyevents/:anomalyEventId`

#### Parameters

The deleteAnomalyEvent api has got 1 parameter

| Parameter      | Type | Required | Population                     |
| -------------- | ---- | -------- | ------------------------------ |
| anomalyEventId | ID   | true     | request.params?.anomalyEventId |

To access the api you can use the **REST** controller with the path **DELETE /anomalyevents/:anomalyEventId**

```js
axios({
  method: "DELETE",
  url: `/anomalyevents/${anomalyEventId}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`anomalyEvent`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "anomalyEvent",
  "action": "delete",
  "appVersion": "Version",
  "rowCount": 1,
  "anomalyEvent": { "id": "ID", "isActive": false }
}
```

### Route: listAnomalyEvents

_Route Definition_ : Paginated/filterable query of anomaly events by type, time, severity, entity, user and status.

_Route Type_ : getList

_Default access route_ : _GET_ `/anomalyevents`

The listAnomalyEvents api has got no parameters.

To access the api you can use the **REST** controller with the path **GET /anomalyevents**

```js
axios({
  method: "GET",
  url: "/anomalyevents",
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`anomalyEvents`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "anomalyEvents",
  "action": "getList",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "anomalyEvents": [{ "id": "ID", "isActive": true }, {}, {}],
  "paging": {
    "pageNumber": "Number",
    "pageRowCount": "NUmber",
    "totalRowCount": "Number",
    "pageCount": "Number"
  },
  "filters": [],
  "uiPermissions": []
}
```

### Authentication Specific Routes

### Common Routes

### Route: currentuser

_Route Definition_: Retrieves the currently authenticated user's session information.

_Route Type_: sessionInfo

_Access Route_: `GET /currentuser`

#### Parameters

This route does **not** require any request parameters.

#### Behavior

- Returns the authenticated session object associated with the current access token.
- If no valid session exists, responds with a 401 Unauthorized.

```js
// Sample GET /currentuser call
axios.get("/currentuser", {
  headers: {
    Authorization: "Bearer your-jwt-token",
  },
});
```

**Success Response**
Returns the session object, including user-related data and token information.

```
{
  "sessionId": "9cf23fa8-07d4-4e7c-80a6-ec6d6ac96bb9",
  "userId": "d92b9d4c-9b1e-4e95-842e-3fb9c8c1df38",
  "email": "user@example.com",
  "fullname": "John Doe",
  "roleId": "user",
  "tenantId": "abc123",
  "accessToken": "jwt-token-string",
  ...
}
```

**Error Response**
**401 Unauthorized:** No active session found.

```
{
  "status": "ERR",
  "message": "No login found"
}
```

**Notes**

- This route is typically used by frontend or mobile applications to fetch the current session state after login.
- The returned session includes key user identity fields, tenant information (if applicable), and the access token for further authenticated requests.
- Always ensure a valid access token is provided in the request to retrieve the session.

### Route: permissions

`*Route Definition*`: Retrieves all effective permission records assigned to the currently authenticated user.

`*Route Type*`: permissionFetch

_Access Route_: `GET /permissions`

#### Parameters

This route does **not** require any request parameters.

#### Behavior

- Fetches all active permission records (`givenPermissions` entries) associated with the current user session.
- Returns a full array of permission objects.
- Requires a valid session (`access token`) to be available.

```js
// Sample GET /permissions call
axios.get("/permissions", {
  headers: {
    Authorization: "Bearer your-jwt-token",
  },
});
```

**Success Response**

Returns an array of permission objects.

```json
[
  {
    "id": "perm1",
    "permissionName": "adminPanel.access",
    "roleId": "admin",
    "subjectUserId": "d92b9d4c-9b1e-4e95-842e-3fb9c8c1df38",
    "subjectUserGroupId": null,
    "objectId": null,
    "canDo": true,
    "tenantCodename": "store123"
  },
  {
    "id": "perm2",
    "permissionName": "orders.manage",
    "roleId": null,
    "subjectUserId": "d92b9d4c-9b1e-4e95-842e-3fb9c8c1df38",
    "subjectUserGroupId": null,
    "objectId": null,
    "canDo": true,
    "tenantCodename": "store123"
  }
]
```

Each object reflects a single permission grant, aligned with the givenPermissions model:

- `**permissionName**`: The permission the user has.
- `**roleId**`: If the permission was granted through a role. -` **subjectUserId**`: If directly granted to the user.
- `**subjectUserGroupId**`: If granted through a group.
- `**objectId**`: If tied to a specific object (OBAC).
- `**canDo**`: True or false flag to represent if permission is active or restricted.

**Error Responses**

- **401 Unauthorized**: No active session found.

```json
{
  "status": "ERR",
  "message": "No login found"
}
```

- **500 Internal Server Error**: Unexpected error fetching permissions.

**Notes**

- The /permissions route is available across all backend services generated by Mindbricks, not just the auth service.
- Auth service: Fetches permissions freshly from the live database (givenPermissions table).
- Other services: Typically use a cached or projected view of permissions stored in a common ElasticSearch store, optimized for faster authorization checks.

> **Tip**:
> Applications can cache permission results client-side or server-side, but should occasionally refresh by calling this endpoint, especially after login or permission-changing operations.

### Route: permissions/:permissionName

_Route Definition_: Checks whether the current user has access to a specific permission, and provides a list of scoped object exceptions or inclusions.

_Route Type_: permissionScopeCheck

_Access Route_: `GET /permissions/:permissionName`

#### Parameters

| Parameter      | Type   | Required | Population                      |
| -------------- | ------ | -------- | ------------------------------- |
| permissionName | String | Yes      | `request.params.permissionName` |

#### Behavior

- Evaluates whether the current user **has access** to the given `permissionName`.
- Returns a structured object indicating:
  - Whether the permission is generally granted (`canDo`)
  - Which object IDs are explicitly included or excluded from access (`exceptions`)
- Requires a valid session (`access token`).

```js
// Sample GET /permissions/orders.manage
axios.get("/permissions/orders.manage", {
  headers: {
    Authorization: "Bearer your-jwt-token",
  },
});
```

**Success Response**

```json
{
  "canDo": true,
  "exceptions": [
    "a1f2e3d4-xxxx-yyyy-zzzz-object1",
    "b2c3d4e5-xxxx-yyyy-zzzz-object2"
  ]
}
```

- If `canDo` is `true`, the user generally has the permission, but not for the objects listed in `exceptions` (i.e., restrictions).
- If `canDo` is `false`, the user does not have the permission by default — but only for the objects in `exceptions`, they do have permission (i.e., selective overrides).
- The exceptions array contains valid **UUID strings**, each corresponding to an object ID (typically from the data model targeted by the permission).

## Copyright

All sources, documents and other digital materials are copyright of .

## About Us

For more information please visit our website: .

.
.
