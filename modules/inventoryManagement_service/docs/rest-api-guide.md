# REST API GUIDE

## salesai-inventorymanagement-service

Maintains inventory records per store, tracks levels and item status, logs all updates and movements (including sales-driven and manual adjustments), detects and publishes low-stock alerts, provides inventory analytics at store and manager level, and features Redis caching for fast lookups.

## Architectural Design Credit and Contact Information

The architectural design of this microservice is credited to .
For inquiries, feedback, or further information regarding the architecture, please direct your communication to:

Email:

We encourage open communication and welcome any questions or discussions related to the architectural aspects of this microservice.

## Documentation Scope

Welcome to the official documentation for the InventoryManagement Service's REST API. This document is designed to provide a comprehensive guide to interfacing with our InventoryManagement Service exclusively through RESTful API endpoints.

**Intended Audience**

This documentation is intended for developers and integrators who are looking to interact with the InventoryManagement Service via HTTP requests for purposes such as creating, updating, deleting and querying InventoryManagement objects.

**Overview**

Within these pages, you will find detailed information on how to effectively utilize the REST API, including authentication methods, request and response formats, endpoint descriptions, and examples of common use cases.

Beyond REST
It's important to note that the InventoryManagement Service also supports alternative methods of interaction, such as gRPC and messaging via a Message Broker. These communication methods are beyond the scope of this document. For information regarding these protocols, please refer to their respective documentation.

## Authentication And Authorization

To ensure secure access to the InventoryManagement service's protected endpoints, a project-wide access token is required. This token serves as the primary method for authenticating requests to our service. However, it's important to note that access control varies across different routes:

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

This section outlines the API endpoints available within the InventoryManagement service. Each endpoint can receive parameters through various methods, meticulously described in the following definitions. It's important to understand the flexibility in how parameters can be included in requests to effectively interact with the InventoryManagement service.

This service is configured to listen for HTTP requests on port `3002`,
serving both the main API interface and default administrative endpoints.

The following routes are available by default:

- **API Test Interface (API Face):** `/`
- **Swagger Documentation:** `/swagger`
- **Postman Collection Download:** `/getPostmanCollection`
- **Health Checks:** `/health` and `/admin/health`
- **Current Session Info:** `/currentuser`
- **Favicon:** `/favicon.ico`

This service is accessible via the following environment-specific URLs:

- **Preview:** `https://inventoryManagement-api-salesai1.prw.mindbricks.com`
- **Staging:** `https://inventoryManagement-api-salesai1.staging.mindbricks.com`
- **Production:** `https://inventoryManagement-api-salesai1.prod.mindbricks.com`

**Parameter Inclusion Methods:**
Parameters can be incorporated into API requests in several ways, each with its designated location. Understanding these methods is crucial for correctly constructing your requests:

**Query Parameters:** Included directly in the URL's query string.

**Path Parameters:** Embedded within the URL's path.

**Body Parameters:** Sent within the JSON body of the request.

**Session Parameters:** Automatically read from the session object. This method is used for parameters that are intrinsic to the user's session, such as userId. When using an API that involves session parameters, you can omit these from your request. The service will automatically bind them to the route, provided that a session is associated with your request.

**Note on Session Parameters:**
Session parameters represent a unique method of parameter inclusion, relying on the context of the user's session. A common example of a session parameter is userId, which the service automatically associates with your request when a session exists. This feature ensures seamless integration of user-specific data without manual input for each request.

By adhering to the specified parameter inclusion methods, you can effectively utilize the InventoryManagement service's API endpoints. For detailed information on each endpoint, including required parameters and their accepted locations, refer to the individual API definitions below.

### Common Parameters

The `InventoryManagement` service's routes support several common parameters designed to modify and enhance the behavior of API requests. These parameters are not individually listed in the API route definitions to avoid repetition. Instead, refer to this section to understand how to leverage these common behaviors across different routes. Note that all common parameters should be included in the query part of the URL.

### Supported Common Parameters:

- **getJoins (BOOLEAN)**: Controls whether to retrieve associated objects along with the main object. By default, `getJoins` is assumed to be `true`. Set it to `false` if you prefer to receive only the main fields of an object, excluding its associations.

- **excludeCQRS (BOOLEAN)**: Applicable only when `getJoins` is `true`. By default, `excludeCQRS` is set to `false`. Enabling this parameter (`true`) omits non-local associations, which are typically more resource-intensive as they require querying external services like ElasticSearch for additional information. Use this to optimize response times and resource usage.

- **requestId (String)**: Identifies a request to enable tracking through the service's log chain. A random hex string of 32 characters is assigned by default. If you wish to use a custom `requestId`, simply include it in your query parameters.

- **caching (BOOLEAN)**: Determines the use of caching for query routes. By default, caching is enabled (`true`). To ensure the freshest data directly from the database, set this parameter to `false`, bypassing the cache.

- **cacheTTL (Integer)**: Specifies the Time-To-Live (TTL) for query caching, in seconds. This is particularly useful for adjusting the default caching duration (5 minutes) for `get list` queries. Setting a custom `cacheTTL` allows you to fine-tune the cache lifespan to meet your needs.

- **pageNumber (Integer)**: For paginated `get list` routes, this parameter selects which page of results to retrieve. The default is `1`, indicating the first page. To disable pagination and retrieve all results, set `pageNumber` to `0`.

- **pageRowCount (Integer)**: In conjunction with paginated routes, this parameter defines the number of records per page. The default value is `25`. Adjusting `pageRowCount` allows you to control the volume of data returned in a single request.

By utilizing these common parameters, you can tailor the behavior of API requests to suit your specific requirements, ensuring optimal performance and usability of the `InventoryManagement` service.

### Multi Tenant Architecture

The `InventoryManagement` service operates within a multi tenant architecture.
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
  - **Tenant Registration**: The `InventoryManagement` service allows for the creation of new tenants only through admin account of the root tenant. So if a new store record is needed, the superadmin or admin roles of the root should create then new tenant and assign any user as the owner of it.

#### Implementation:

When the user logins there may be few ways for Mindbricks to recognize and set the tenant id in the session.

1. Mindbricks will check the url of the login request if it matches tenant url.
2. Mindbricks will check the `` has the tenant id.
3. Mindbricks will check if the user is associated with a `store` in the data model.
   After you login a tenant successfully, ensure that your requests accurately target objects that fall within the tenant scope set during the login session.
   Ensure your requests are correctly formatted to include the domain sandbox information in the header. This enables the `InventoryManagement` service to accurately identify the domain context, facilitating proper access control and data management based on the user's permissions and the specified domain.

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

By adhering to this domain sandbox model, the `InventoryManagement` service maintains a secure and organized structure for handling requests across different domains, ensuring that operations are performed within the correct contextual boundaries.

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

When the `InventoryManagement` service processes requests successfully, it wraps the requested resource(s) within a JSON envelope. This envelope not only contains the data but also includes essential metadata, such as configuration details and pagination information, to enrich the response and provide context to the client.

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

InventoryManagement service provides the following resources which are stored in its own database as a data object. Note that a resource for an api access is a data object for the service.

### InventoryItem resource

_Resource Definition_ : Tracks the quantity and status of a specific product in a given store, including thresholds for low-stock alerts and isolation by store.
_InventoryItem Resource Properties_
| Name | Type | Required | Default | Definition |
| ---- | ---- | -------- | ------- | ---------- |
| **productId** | String | | | _Unique product SKU or identifier (string, as no central product object is currently defined)._ |
| **quantity** | Integer | | | _The current quantity of this product in the store&#39;s inventory._ |
| **status** | Enum | | | _Status of inventory item: 0=in-stock, 1=out-of-stock, 2=low-stock, 3=damaged, 4=reserved_ |
| **lowStockThreshold** | Integer | | | _Threshold quantity; if quantity &lt;= this value, the item is considered low-stock and triggers alerts._ |
| **lastSyncTimestamp** | Date | | | _Timestamp when the inventoryItem was last synchronized with remote/manual updates._ |
| **storeId** | ID | | | _An ID value to represent the tenant id of the store_ |

#### Enum Properties

Enum properties are represented as Small Integer values (0-255) in the database. The values are mapped to their corresponding names in the application layer.

##### status Enum Property

_Enum Options_
| Name | Value | Index |
| ---- | ----- | ----- |
| **inStock** | `"inStock""` | 0 |
| **outOfStock** | `"outOfStock""` | 1 |
| **lowStock** | `"lowStock""` | 2 |
| **damaged** | `"damaged""` | 3 |
| **reserved** | `"reserved""` | 4 |

### InventoryMovement resource

_Resource Definition_ : Logs each inventory movement (increase or decrease), recording the change type, value, reason, and related user and inventory item.
_InventoryMovement Resource Properties_
| Name | Type | Required | Default | Definition |
| ---- | ---- | -------- | ------- | ---------- |
| **inventoryItemId** | ID | | | _Reference to the inventoryItem this movement relates to._ |
| **quantityDelta** | Integer | | | _Amount of increase (+) or decrease (-) in inventory for this movement._ |
| **movementType** | Enum | | | _Type of inventory movement: 0=sale, 1=restock, 2=manualAdjustment, 3=correction, 4=dump/damage, 5=transfer._ |
| **movementTimestamp** | Date | | | _Timestamp when the movement occurred._ |
| **userId** | ID | | | _User who performed the movement or adjustment._ |
| **movementReason** | Text | | | _Freeform reason comment for this movement (optional unless manual/correction)._ |
| **storeId** | ID | | | _An ID value to represent the tenant id of the store_ |

#### Enum Properties

Enum properties are represented as Small Integer values (0-255) in the database. The values are mapped to their corresponding names in the application layer.

##### movementType Enum Property

_Enum Options_
| Name | Value | Index |
| ---- | ----- | ----- |
| **sale** | `"sale""` | 0 |
| **restock** | `"restock""` | 1 |
| **manualAdjustment** | `"manualAdjustment""` | 2 |
| **correction** | `"correction""` | 3 |
| **damage** | `"damage""` | 4 |
| **transfer** | `"transfer""` | 5 |

### LowStockAlert resource

_Resource Definition_ : Represents a low-stock or high-risk inventory item event; alerts sellers/managers of the condition and supports audit/resolution.
_LowStockAlert Resource Properties_
| Name | Type | Required | Default | Definition |
| ---- | ---- | -------- | ------- | ---------- |
| **inventoryItemId** | ID | | | _Inventory item triggering this low-stock alert._ |
| **alertType** | Enum | | | _Type of inventory alert: 0=lowStock, 1=outOfStock, 2=highRisk_ |
| **alertTimestamp** | Date | | | _Timestamp when alert was triggered._ |
| **resolved** | Boolean | | | _Flag for whether this alert has been acknowledged or resolved._ |
| **resolvedByUserId** | ID | | | _User who resolved or acknowledged the alert (optional)._ |
| **resolvedTimestamp** | Date | | | _Timestamp when alert was resolved or acknowledged._ |
| **storeId** | ID | | | _An ID value to represent the tenant id of the store_ |

#### Enum Properties

Enum properties are represented as Small Integer values (0-255) in the database. The values are mapped to their corresponding names in the application layer.

##### alertType Enum Property

_Enum Options_
| Name | Value | Index |
| ---- | ----- | ----- |
| **lowStock** | `"lowStock""` | 0 |
| **outOfStock** | `"outOfStock""` | 1 |
| **highRisk** | `"highRisk""` | 2 |

## Crud Routes

### Route: getInventoryItem

_Route Definition_ : Retrieve a single inventory item by its id.

_Route Type_ : get

_Default access route_ : _GET_ `/inventoryitems/:inventoryItemId`

#### Parameters

The getInventoryItem api has got 1 parameter

| Parameter       | Type | Required | Population                      |
| --------------- | ---- | -------- | ------------------------------- |
| inventoryItemId | ID   | true     | request.params?.inventoryItemId |

To access the api you can use the **REST** controller with the path **GET /inventoryitems/:inventoryItemId**

```js
axios({
  method: "GET",
  url: `/inventoryitems/${inventoryItemId}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`inventoryItem`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "inventoryItem",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "inventoryItem": { "id": "ID", "isActive": true }
}
```

### Route: createInventoryItem

_Route Definition_ : Create a new inventory item in the store for a given product.

_Route Type_ : create

_Default access route_ : _POST_ `/inventoryitems`

#### Parameters

The createInventoryItem api has got 5 parameters

| Parameter         | Type    | Required | Population                      |
| ----------------- | ------- | -------- | ------------------------------- |
| productId         | String  | true     | request.body?.productId         |
| quantity          | Integer | true     | request.body?.quantity          |
| status            | Enum    | true     | request.body?.status            |
| lowStockThreshold | Integer | true     | request.body?.lowStockThreshold |
| lastSyncTimestamp | Date    | false    | request.body?.lastSyncTimestamp |

To access the api you can use the **REST** controller with the path **POST /inventoryitems**

```js
axios({
  method: "POST",
  url: "/inventoryitems",
  data: {
    productId: "String",
    quantity: "Integer",
    status: "Enum",
    lowStockThreshold: "Integer",
    lastSyncTimestamp: "Date",
  },
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`inventoryItem`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "inventoryItem",
  "action": "create",
  "appVersion": "Version",
  "rowCount": 1,
  "inventoryItem": { "id": "ID", "isActive": true }
}
```

### Route: updateInventoryItem

_Route Definition_ : Update an inventory item’s quantity/status/thresholds as allowed.

_Route Type_ : update

_Default access route_ : _PATCH_ `/inventoryitems/:inventoryItemId`

#### Parameters

The updateInventoryItem api has got 5 parameters

| Parameter         | Type    | Required | Population                      |
| ----------------- | ------- | -------- | ------------------------------- |
| inventoryItemId   | ID      | true     | request.params?.inventoryItemId |
| quantity          | Integer | false    | request.body?.quantity          |
| status            | Enum    | false    | request.body?.status            |
| lowStockThreshold | Integer | false    | request.body?.lowStockThreshold |
| lastSyncTimestamp | Date    | false    | request.body?.lastSyncTimestamp |

To access the api you can use the **REST** controller with the path **PATCH /inventoryitems/:inventoryItemId**

```js
axios({
  method: "PATCH",
  url: `/inventoryitems/${inventoryItemId}`,
  data: {
    quantity: "Integer",
    status: "Enum",
    lowStockThreshold: "Integer",
    lastSyncTimestamp: "Date",
  },
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`inventoryItem`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "inventoryItem",
  "action": "update",
  "appVersion": "Version",
  "rowCount": 1,
  "inventoryItem": { "id": "ID", "isActive": true }
}
```

### Route: deleteInventoryItem

_Route Definition_ : Delete or deactivate an inventory item record.

_Route Type_ : delete

_Default access route_ : _DELETE_ `/inventoryitems/:inventoryItemId`

#### Parameters

The deleteInventoryItem api has got 1 parameter

| Parameter       | Type | Required | Population                      |
| --------------- | ---- | -------- | ------------------------------- |
| inventoryItemId | ID   | true     | request.params?.inventoryItemId |

To access the api you can use the **REST** controller with the path **DELETE /inventoryitems/:inventoryItemId**

```js
axios({
  method: "DELETE",
  url: `/inventoryitems/${inventoryItemId}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`inventoryItem`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "inventoryItem",
  "action": "delete",
  "appVersion": "Version",
  "rowCount": 1,
  "inventoryItem": { "id": "ID", "isActive": false }
}
```

### Route: listInventoryItems

_Route Definition_ : Get a list of inventory items by filters (store, product, status).

_Route Type_ : getList

_Default access route_ : _GET_ `/inventoryitems`

The listInventoryItems api has got no parameters.

To access the api you can use the **REST** controller with the path **GET /inventoryitems**

```js
axios({
  method: "GET",
  url: "/inventoryitems",
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`inventoryItems`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "inventoryItems",
  "action": "getList",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "inventoryItems": [{ "id": "ID", "isActive": true }, {}, {}],
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

### Route: getInventoryMovement

_Route Definition_ : Get details of a single inventory movement record by id.

_Route Type_ : get

_Default access route_ : _GET_ `/inventorymovements/:inventoryMovementId`

#### Parameters

The getInventoryMovement api has got 1 parameter

| Parameter           | Type | Required | Population                          |
| ------------------- | ---- | -------- | ----------------------------------- |
| inventoryMovementId | ID   | true     | request.params?.inventoryMovementId |

To access the api you can use the **REST** controller with the path **GET /inventorymovements/:inventoryMovementId**

```js
axios({
  method: "GET",
  url: `/inventorymovements/${inventoryMovementId}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`inventoryMovement`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "inventoryMovement",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "inventoryMovement": { "id": "ID", "isActive": true }
}
```

### Route: createInventoryMovement

_Route Definition_ : Record a new inventory movement (i.e., adjustment, sale, restock, etc).

_Route Type_ : create

_Default access route_ : _POST_ `/inventorymovements`

#### Parameters

The createInventoryMovement api has got 6 parameters

| Parameter         | Type    | Required | Population                      |
| ----------------- | ------- | -------- | ------------------------------- |
| inventoryItemId   | ID      | true     | request.body?.inventoryItemId   |
| quantityDelta     | Integer | true     | request.body?.quantityDelta     |
| movementType      | Enum    | true     | request.body?.movementType      |
| movementTimestamp | Date    | true     | request.body?.movementTimestamp |
| userId            | ID      | true     | request.body?.userId            |
| movementReason    | Text    | false    | request.body?.movementReason    |

To access the api you can use the **REST** controller with the path **POST /inventorymovements**

```js
axios({
  method: "POST",
  url: "/inventorymovements",
  data: {
    inventoryItemId: "ID",
    quantityDelta: "Integer",
    movementType: "Enum",
    movementTimestamp: "Date",
    userId: "ID",
    movementReason: "Text",
  },
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`inventoryMovement`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "inventoryMovement",
  "action": "create",
  "appVersion": "Version",
  "rowCount": 1,
  "inventoryMovement": { "id": "ID", "isActive": true }
}
```

### Route: deleteInventoryMovement

_Route Definition_ : Soft-delete a movement record (if needed for audit correction).

_Route Type_ : delete

_Default access route_ : _DELETE_ `/inventorymovements/:inventoryMovementId`

#### Parameters

The deleteInventoryMovement api has got 1 parameter

| Parameter           | Type | Required | Population                          |
| ------------------- | ---- | -------- | ----------------------------------- |
| inventoryMovementId | ID   | true     | request.params?.inventoryMovementId |

To access the api you can use the **REST** controller with the path **DELETE /inventorymovements/:inventoryMovementId**

```js
axios({
  method: "DELETE",
  url: `/inventorymovements/${inventoryMovementId}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`inventoryMovement`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "inventoryMovement",
  "action": "delete",
  "appVersion": "Version",
  "rowCount": 1,
  "inventoryMovement": { "id": "ID", "isActive": false }
}
```

### Route: listInventoryMovements

_Route Definition_ : Get a list/history of inventory movements for reporting or audit (filtered by item/store/user/timestamp/type).

_Route Type_ : getList

_Default access route_ : _GET_ `/inventorymovements`

The listInventoryMovements api has got no parameters.

To access the api you can use the **REST** controller with the path **GET /inventorymovements**

```js
axios({
  method: "GET",
  url: "/inventorymovements",
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`inventoryMovements`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "inventoryMovements",
  "action": "getList",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "inventoryMovements": [{ "id": "ID", "isActive": true }, {}, {}],
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

### Route: getLowStockAlert

_Route Definition_ : Get a specific low-stock alert by id.

_Route Type_ : get

_Default access route_ : _GET_ `/lowstockalerts/:lowStockAlertId`

#### Parameters

The getLowStockAlert api has got 1 parameter

| Parameter       | Type | Required | Population                      |
| --------------- | ---- | -------- | ------------------------------- |
| lowStockAlertId | ID   | true     | request.params?.lowStockAlertId |

To access the api you can use the **REST** controller with the path **GET /lowstockalerts/:lowStockAlertId**

```js
axios({
  method: "GET",
  url: `/lowstockalerts/${lowStockAlertId}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`lowStockAlert`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "lowStockAlert",
  "action": "get",
  "appVersion": "Version",
  "rowCount": 1,
  "lowStockAlert": { "id": "ID", "isActive": true }
}
```

### Route: createLowStockAlert

_Route Definition_ : Create a low-stock alert event for an inventory item (usually system-triggered).

_Route Type_ : create

_Default access route_ : _POST_ `/lowstockalerts`

#### Parameters

The createLowStockAlert api has got 6 parameters

| Parameter         | Type    | Required | Population                      |
| ----------------- | ------- | -------- | ------------------------------- |
| inventoryItemId   | ID      | true     | request.body?.inventoryItemId   |
| alertType         | Enum    | true     | request.body?.alertType         |
| alertTimestamp    | Date    | true     | request.body?.alertTimestamp    |
| resolved          | Boolean | false    | request.body?.resolved          |
| resolvedByUserId  | ID      | false    | request.body?.resolvedByUserId  |
| resolvedTimestamp | Date    | false    | request.body?.resolvedTimestamp |

To access the api you can use the **REST** controller with the path **POST /lowstockalerts**

```js
axios({
  method: "POST",
  url: "/lowstockalerts",
  data: {
    inventoryItemId: "ID",
    alertType: "Enum",
    alertTimestamp: "Date",
    resolved: "Boolean",
    resolvedByUserId: "ID",
    resolvedTimestamp: "Date",
  },
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`lowStockAlert`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "lowStockAlert",
  "action": "create",
  "appVersion": "Version",
  "rowCount": 1,
  "lowStockAlert": { "id": "ID", "isActive": true }
}
```

### Route: resolveLowStockAlert

_Route Definition_ : Update alert status (e.g., set resolved or assign acknowledger/timestamp).

_Route Type_ : update

_Default access route_ : _PATCH_ `/resolvelowstockalert/:lowStockAlertId`

#### Parameters

The resolveLowStockAlert api has got 4 parameters

| Parameter         | Type    | Required | Population                      |
| ----------------- | ------- | -------- | ------------------------------- |
| lowStockAlertId   | ID      | true     | request.params?.lowStockAlertId |
| resolved          | Boolean | false    | request.body?.resolved          |
| resolvedByUserId  | ID      | false    | request.body?.resolvedByUserId  |
| resolvedTimestamp | Date    | false    | request.body?.resolvedTimestamp |

To access the api you can use the **REST** controller with the path **PATCH /resolvelowstockalert/:lowStockAlertId**

```js
axios({
  method: "PATCH",
  url: `/resolvelowstockalert/${lowStockAlertId}`,
  data: {
    resolved: "Boolean",
    resolvedByUserId: "ID",
    resolvedTimestamp: "Date",
  },
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`lowStockAlert`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "lowStockAlert",
  "action": "update",
  "appVersion": "Version",
  "rowCount": 1,
  "lowStockAlert": { "id": "ID", "isActive": true }
}
```

### Route: deleteLowStockAlert

_Route Definition_ : Delete (soft delete) a lowStockAlert record.

_Route Type_ : delete

_Default access route_ : _DELETE_ `/lowstockalerts/:lowStockAlertId`

#### Parameters

The deleteLowStockAlert api has got 1 parameter

| Parameter       | Type | Required | Population                      |
| --------------- | ---- | -------- | ------------------------------- |
| lowStockAlertId | ID   | true     | request.params?.lowStockAlertId |

To access the api you can use the **REST** controller with the path **DELETE /lowstockalerts/:lowStockAlertId**

```js
axios({
  method: "DELETE",
  url: `/lowstockalerts/${lowStockAlertId}`,
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`lowStockAlert`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "lowStockAlert",
  "action": "delete",
  "appVersion": "Version",
  "rowCount": 1,
  "lowStockAlert": { "id": "ID", "isActive": false }
}
```

### Route: listLowStockAlerts

_Route Definition_ : List all low-stock alerts (for store/manager, filter by resolved/status, etc).

_Route Type_ : getList

_Default access route_ : _GET_ `/lowstockalerts`

The listLowStockAlerts api has got no parameters.

To access the api you can use the **REST** controller with the path **GET /lowstockalerts**

```js
axios({
  method: "GET",
  url: "/lowstockalerts",
  data: {},
  params: {},
});
```

The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`lowStockAlerts`** object in the respones. However, some properties may be omitted based on the object's internal logic.

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
  "dataName": "lowStockAlerts",
  "action": "getList",
  "appVersion": "Version",
  "rowCount": "\"Number\"",
  "lowStockAlerts": [{ "id": "ID", "isActive": true }, {}, {}],
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
