 

# REST API GUIDE 
## salesai-platformadmin-service

Platform-wide backend administration: OpenAPI schema/versioning, system health checks, CI/CD, repo/cache backend switching, seed/test data operations, JWT/session config &amp; rotation, API/WebSocket auth monitoring, global config control. Coordinates and logs all admin operations; RBAC and stores managed in auth/store services.

## Architectural Design Credit and Contact Information

The architectural design of this microservice is credited to . 
For inquiries, feedback, or further information regarding the architecture, please direct your communication to:

Email: 

We encourage open communication and welcome any questions or discussions related to the architectural aspects of this microservice.

## Documentation Scope

Welcome to the official documentation for the PlatformAdmin Service's REST API. This document is designed to provide a comprehensive guide to interfacing with our PlatformAdmin Service exclusively through RESTful API endpoints.

**Intended Audience**

This documentation is intended for developers and integrators who are looking to interact with the PlatformAdmin Service via HTTP requests for purposes such as creating, updating, deleting and querying PlatformAdmin objects.

**Overview**

Within these pages, you will find detailed information on how to effectively utilize the REST API, including authentication methods, request and response formats, endpoint descriptions, and examples of common use cases.

Beyond REST
It's important to note that the PlatformAdmin Service also supports alternative methods of interaction, such as gRPC and messaging via a Message Broker. These communication methods are beyond the scope of this document. For information regarding these protocols, please refer to their respective documentation.

## Authentication And Authorization

To ensure secure access to the PlatformAdmin service's protected endpoints, a project-wide access token is required. This token serves as the primary method for authenticating requests to our service. However, it's important to note that access control varies across different routes:

**Protected Routes**: 
Certain routes require specific authorization levels. Access to these routes is contingent upon the possession of a valid access token that meets the route-specific authorization criteria. Unauthorized requests to these routes will be rejected.

**Public Routes**: 
The service also includes routes that are accessible without authentication. These public endpoints are designed for open access and do not require an access token.

### Token Locations
When including your access token in a request, ensure it is placed in one of the following specified locations. The service will sequentially search these locations for the token, utilizing the first one it encounters.

| Location               | Token Name / Param Name      |
| ---------------------- | ---------------------------- |
| Query                  | access_token                 |
| Authorization Header   | Bearer                       |
| Header                 | salesai1-access-token|
| Header                 | salesai1-access-token-{storeCodename}|
| Cookie                 | salesai1-access-token-{storeCodename}|


Please ensure the token is correctly placed in one of these locations, using the appropriate label as indicated. The service prioritizes these locations in the order listed, processing the first token it successfully identifies.


## Api Definitions
This section outlines the API endpoints available within the PlatformAdmin service. Each endpoint can receive parameters through various methods, meticulously described in the following definitions. It's important to understand the flexibility in how parameters can be included in requests to effectively interact with the PlatformAdmin service.

This service is configured to listen for HTTP requests on port `3006`, 
serving both the main API interface and default administrative endpoints.

The following routes are available by default:

* **API Test Interface (API Face):** `/`
* **Swagger Documentation:** `/swagger`
* **Postman Collection Download:** `/getPostmanCollection`
* **Health Checks:** `/health` and `/admin/health`
* **Current Session Info:** `/currentuser`
* **Favicon:** `/favicon.ico`

This service is accessible via the following environment-specific URLs:

* **Preview:** `https://platformAdmin-api-salesai1.prw.mindbricks.com`
* **Staging:** `https://platformAdmin-api-salesai1.staging.mindbricks.com`
* **Production:** `https://platformAdmin-api-salesai1.prod.mindbricks.com`


**Parameter Inclusion Methods:**
Parameters can be incorporated into API requests in several ways, each with its designated location. Understanding these methods is crucial for correctly constructing your requests:

**Query Parameters:** Included directly in the URL's query string.

**Path Parameters:** Embedded within the URL's path.

**Body Parameters:** Sent within the JSON body of the request.

**Session Parameters:** Automatically read from the session object. This method is used for parameters that are intrinsic to the user's session, such as userId. When using an API that involves session parameters, you can omit these from your request. The service will automatically bind them to the route, provided that a session is associated with your request.

**Note on Session Parameters:**
Session parameters represent a unique method of parameter inclusion, relying on the context of the user's session. A common example of a session parameter is userId, which the service automatically associates with your request when a session exists. This feature ensures seamless integration of user-specific data without manual input for each request.

By adhering to the specified parameter inclusion methods, you can effectively utilize the PlatformAdmin service's API endpoints. For detailed information on each endpoint, including required parameters and their accepted locations, refer to the individual API definitions below.

### Common Parameters

The `PlatformAdmin` service's routes support several common parameters designed to modify and enhance the behavior of API requests. These parameters are not individually listed in the API route definitions to avoid repetition. Instead, refer to this section to understand how to leverage these common behaviors across different routes. Note that all common parameters should be included in the query part of the URL.

### Supported Common Parameters:

- **getJoins (BOOLEAN)**: Controls whether to retrieve associated objects along with the main object. By default, `getJoins` is assumed to be `true`. Set it to `false` if you prefer to receive only the main fields of an object, excluding its associations.

- **excludeCQRS (BOOLEAN)**: Applicable only when `getJoins` is `true`. By default, `excludeCQRS` is set to `false`. Enabling this parameter (`true`) omits non-local associations, which are typically more resource-intensive as they require querying external services like ElasticSearch for additional information. Use this to optimize response times and resource usage.

- **requestId (String)**: Identifies a request to enable tracking through the service's log chain. A random hex string of 32 characters is assigned by default. If you wish to use a custom `requestId`, simply include it in your query parameters.

- **caching (BOOLEAN)**: Determines the use of caching for query routes. By default, caching is enabled (`true`). To ensure the freshest data directly from the database, set this parameter to `false`, bypassing the cache.

- **cacheTTL (Integer)**: Specifies the Time-To-Live (TTL) for query caching, in seconds. This is particularly useful for adjusting the default caching duration (5 minutes) for `get list` queries. Setting a custom `cacheTTL` allows you to fine-tune the cache lifespan to meet your needs.

- **pageNumber (Integer)**: For paginated `get list` routes, this parameter selects which page of results to retrieve. The default is `1`, indicating the first page. To disable pagination and retrieve all results, set `pageNumber` to `0`.

- **pageRowCount (Integer)**: In conjunction with paginated routes, this parameter defines the number of records per page. The default value is `25`. Adjusting `pageRowCount` allows you to control the volume of data returned in a single request.

By utilizing these common parameters, you can tailor the behavior of API requests to suit your specific requirements, ensuring optimal performance and usability of the `PlatformAdmin` service.


  ### Multi Tenant Architecture

  The `PlatformAdmin` service operates within a multi tenant architecture.
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
    - **Tenant Registration**: The `PlatformAdmin` service allows for the creation of new tenants only through admin account of the root tenant. So if a new store record is needed, the superadmin or admin roles of the root should create then new tenant and assign any user as the owner of it.
  
  #### Implementation:

  When the user logins there may be few ways for Mindbricks to recognize and set the tenant id in the session.
  1. Mindbricks will check the url of the login request if it matches tenant url.
  2. Mindbricks will check the `` has the tenant id.
  3. Mindbricks will check if the user is associated with a `store` in the data model.
  After you login a tenant successfully, ensure that your requests accurately target objects that fall within the tenant scope set during the login session.
  Ensure your requests are correctly formatted to include the domain sandbox information in the header. This enables the `PlatformAdmin` service to accurately identify the domain context, facilitating proper access control and data management based on the user's permissions and the specified domain.  
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
  By adhering to this domain sandbox model, the `PlatformAdmin` service maintains a secure and organized structure for handling requests across different domains, ensuring that operations are performed within the correct contextual boundaries.

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

When the `PlatformAdmin` service processes requests successfully, it wraps the requested resource(s) within a JSON envelope. This envelope not only contains the data but also includes essential metadata, such as configuration details and pagination information, to enrich the response and provide context to the client.

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
PlatformAdmin service provides the following resources which are stored in its own database as a data object. Note that a resource for an api access is a data object for the service.

### OpenApiSchema resource

*Resource Definition* : Stores current and historical OpenAPI schema definitions for all APIs, including versioning and description metadata.
*OpenApiSchema Resource Properties* 
| Name | Type | Required | Default | Definition | 
| ---- | ---- | -------- | ------- | ---------- |
| **version** | String |  |  | *Schema version (e.g., &#39;v1.0.3&#39;).* |
| **description** | Text |  |  | *Description/notes about this schema version.* |
| **schemaJson** | Text |  |  | *Raw OpenAPI schema JSON (stringified).* |
## Crud Routes
### Route: getOpenApiSchema
*Route Definition* : Get a specific OpenAPI schema by id

*Route Type* : get

*Default access route* : *GET* `/openapischemas/:openApiSchemaId`

####  Parameters
The getOpenApiSchema api has got 1 parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| openApiSchemaId  | ID  | true | request.params?.openApiSchemaId |

  

  



To access the api you can use the **REST** controller with the path **GET  /openapischemas/:openApiSchemaId**
```js
  axios({
    method: 'GET',
    url: `/openapischemas/${openApiSchemaId}`,
    data: {
    
    },
    params: {
    
    }
  });
```     
The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`openApiSchema`** object in the respones. However, some properties may be omitted based on the object's internal logic.

This route's response is constrained to a select list of properties, and therefore does not encompass all attributes of the resource.



```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"openApiSchema","action":"get","appVersion":"Version","rowCount":1,"openApiSchema":{"id":"ID","isActive":true}}
```  


  

### Route: createOpenApiSchema
*Route Definition* : Create new OpenAPI schema entry.

*Route Type* : create

*Default access route* : *POST* `/openapischemas`

####  Parameters
The createOpenApiSchema api has got 3 parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| version  | String  | true | request.body?.version |
| description  | Text  | false | request.body?.description |
| schemaJson  | Text  | true | request.body?.schemaJson |

  

  



To access the api you can use the **REST** controller with the path **POST  /openapischemas**
```js
  axios({
    method: 'POST',
    url: '/openapischemas',
    data: {
            version:"String",  
            description:"Text",  
            schemaJson:"Text",  
    
    },
    params: {
    
    }
  });
```     
The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`openApiSchema`** object in the respones. However, some properties may be omitted based on the object's internal logic.

This route's response is constrained to a select list of properties, and therefore does not encompass all attributes of the resource.



```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"openApiSchema","action":"create","appVersion":"Version","rowCount":1,"openApiSchema":{"id":"ID","isActive":true}}
```  


  

### Route: updateOpenApiSchema
*Route Definition* : Update description or schemaJson for a given version.

*Route Type* : update

*Default access route* : *PATCH* `/openapischemas/:openApiSchemaId`

####  Parameters
The updateOpenApiSchema api has got 3 parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| openApiSchemaId  | ID  | true | request.params?.openApiSchemaId |
| description  | Text  | false | request.body?.description |
| schemaJson  | Text  | false | request.body?.schemaJson |

  

  



To access the api you can use the **REST** controller with the path **PATCH  /openapischemas/:openApiSchemaId**
```js
  axios({
    method: 'PATCH',
    url: `/openapischemas/${openApiSchemaId}`,
    data: {
            description:"Text",  
            schemaJson:"Text",  
    
    },
    params: {
    
    }
  });
```     
The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`openApiSchema`** object in the respones. However, some properties may be omitted based on the object's internal logic.

This route's response is constrained to a select list of properties, and therefore does not encompass all attributes of the resource.



```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"openApiSchema","action":"update","appVersion":"Version","rowCount":1,"openApiSchema":{"id":"ID","isActive":true}}
```  


  

### Route: deleteOpenApiSchema
*Route Definition* : Soft-delete an OpenAPI schema version.

*Route Type* : delete

*Default access route* : *DELETE* `/openapischemas/:openApiSchemaId`

####  Parameters
The deleteOpenApiSchema api has got 1 parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| openApiSchemaId  | ID  | true | request.params?.openApiSchemaId |

  

  



To access the api you can use the **REST** controller with the path **DELETE  /openapischemas/:openApiSchemaId**
```js
  axios({
    method: 'DELETE',
    url: `/openapischemas/${openApiSchemaId}`,
    data: {
    
    },
    params: {
    
    }
  });
```     
The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`openApiSchema`** object in the respones. However, some properties may be omitted based on the object's internal logic.

This route's response is constrained to a select list of properties, and therefore does not encompass all attributes of the resource.



```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"openApiSchema","action":"delete","appVersion":"Version","rowCount":1,"openApiSchema":{"id":"ID","isActive":false}}
```  


  

### Route: listOpenApiSchemas
*Route Definition* : List OpenAPI schemas (all versions/history).

*Route Type* : getList

*Default access route* : *GET* `/openapischemas`

The listOpenApiSchemas api has got no parameters.    

  

  



To access the api you can use the **REST** controller with the path **GET  /openapischemas**
```js
  axios({
    method: 'GET',
    url: '/openapischemas',
    data: {
    
    },
    params: {
    
    }
  });
```     
The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`openApiSchemas`** object in the respones. However, some properties may be omitted based on the object's internal logic.

This route's response is constrained to a select list of properties, and therefore does not encompass all attributes of the resource.



```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"openApiSchemas","action":"getList","appVersion":"Version","rowCount":"\"Number\"","openApiSchemas":[{"id":"ID","isActive":true},{},{}],"paging":{"pageNumber":"Number","pageRowCount":"NUmber","totalRowCount":"Number","pageCount":"Number"},"filters":[],"uiPermissions":[]}
```  


  



### Authentication Specific Routes



### Common Routes

### Route: currentuser

*Route Definition*: Retrieves the currently authenticated user's session information.

*Route Type*: sessionInfo

*Access Route*: `GET /currentuser`

#### Parameters

This route does **not** require any request parameters.

#### Behavior

- Returns the authenticated session object associated with the current access token.
- If no valid session exists, responds with a 401 Unauthorized.

```js
// Sample GET /currentuser call
axios.get("/currentuser", {
  headers: {
    "Authorization": "Bearer your-jwt-token"
  }
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
* This route is typically used by frontend or mobile applications to fetch the current session state after login.
* The returned session includes key user identity fields, tenant information (if applicable), and the access token for further authenticated requests.
* Always ensure a valid access token is provided in the request to retrieve the session.

### Route: permissions

`*Route Definition*`: Retrieves all effective permission records assigned to the currently authenticated user.

`*Route Type*`: permissionFetch

*Access Route*: `GET /permissions`

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
    "Authorization": "Bearer your-jwt-token"
  }
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
- `**roleId**`: If the permission was granted through a role.
-` **subjectUserId**`: If directly granted to the user.
- `**subjectUserGroupId**`: If granted through a group.
- `**objectId**`: If tied to a specific object (OBAC).
- `**canDo**`: True or false flag to represent if permission is active or restricted.

**Error Responses**
* **401 Unauthorized**: No active session found.
```json
{
  "status": "ERR",
  "message": "No login found"
}
```
* **500 Internal Server Error**: Unexpected error fetching permissions.

**Notes**
* The /permissions route is available across all backend services generated by Mindbricks, not just the auth service.
* Auth service: Fetches permissions freshly from the live database (givenPermissions table).
* Other services: Typically use a cached or projected view of permissions stored in a common ElasticSearch store, optimized for faster authorization checks.

> **Tip**:
> Applications can cache permission results client-side or server-side, but should occasionally refresh by calling this endpoint, especially after login or permission-changing operations.

### Route: permissions/:permissionName

*Route Definition*: Checks whether the current user has access to a specific permission, and provides a list of scoped object exceptions or inclusions.

*Route Type*: permissionScopeCheck

*Access Route*: `GET /permissions/:permissionName`

#### Parameters

| Parameter         | Type   | Required | Population             |
|------------------|--------|----------|------------------------|
| permissionName   | String | Yes      | `request.params.permissionName` |

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
    "Authorization": "Bearer your-jwt-token"
  }
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

* If `canDo` is `true`, the user generally has the permission, but not for the objects listed in `exceptions` (i.e., restrictions).
* If `canDo` is `false`, the user does not have the permission by default — but only for the objects in `exceptions`, they do have permission (i.e., selective overrides).
* The exceptions array contains valid **UUID strings**, each corresponding to an object ID (typically from the data model targeted by the permission).

## Copyright
All sources, documents and other digital materials are copyright of .

## About Us
For more information please visit our website: .

.
.
