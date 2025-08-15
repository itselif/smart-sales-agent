 

# REST API GUIDE 
## salesai-auth-service

Authentication service for the project

## Architectural Design Credit and Contact Information

The architectural design of this microservice is credited to . 
For inquiries, feedback, or further information regarding the architecture, please direct your communication to:

Email: 

We encourage open communication and welcome any questions or discussions related to the architectural aspects of this microservice.

## Documentation Scope

Welcome to the official documentation for the Auth Service's REST API. This document is designed to provide a comprehensive guide to interfacing with our Auth Service exclusively through RESTful API endpoints.

**Intended Audience**

This documentation is intended for developers and integrators who are looking to interact with the Auth Service via HTTP requests for purposes such as creating, updating, deleting and querying Auth objects.

**Overview**

Within these pages, you will find detailed information on how to effectively utilize the REST API, including authentication methods, request and response formats, endpoint descriptions, and examples of common use cases.

Beyond REST
It's important to note that the Auth Service also supports alternative methods of interaction, such as gRPC and messaging via a Message Broker. These communication methods are beyond the scope of this document. For information regarding these protocols, please refer to their respective documentation.

## Authentication And Authorization

To ensure secure access to the Auth service's protected endpoints, a project-wide access token is required. This token serves as the primary method for authenticating requests to our service. However, it's important to note that access control varies across different routes:

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
This section outlines the API endpoints available within the Auth service. Each endpoint can receive parameters through various methods, meticulously described in the following definitions. It's important to understand the flexibility in how parameters can be included in requests to effectively interact with the Auth service.

This service is configured to listen for HTTP requests on port `3001`, 
serving both the main API interface and default administrative endpoints.

The following routes are available by default:

* **API Test Interface (API Face):** `/`
* **Swagger Documentation:** `/swagger`
* **Postman Collection Download:** `/getPostmanCollection`
* **Health Checks:** `/health` and `/admin/health`
* **Current Session Info:** `/currentuser`
* **Favicon:** `/favicon.ico`

This service is accessible via the following environment-specific URLs:

* **Preview:** `https://auth-api-salesai1.prw.mindbricks.com`
* **Staging:** `https://auth-api-salesai1.staging.mindbricks.com`
* **Production:** `https://auth-api-salesai1.prod.mindbricks.com`


**Parameter Inclusion Methods:**
Parameters can be incorporated into API requests in several ways, each with its designated location. Understanding these methods is crucial for correctly constructing your requests:

**Query Parameters:** Included directly in the URL's query string.

**Path Parameters:** Embedded within the URL's path.

**Body Parameters:** Sent within the JSON body of the request.

**Session Parameters:** Automatically read from the session object. This method is used for parameters that are intrinsic to the user's session, such as userId. When using an API that involves session parameters, you can omit these from your request. The service will automatically bind them to the route, provided that a session is associated with your request.

**Note on Session Parameters:**
Session parameters represent a unique method of parameter inclusion, relying on the context of the user's session. A common example of a session parameter is userId, which the service automatically associates with your request when a session exists. This feature ensures seamless integration of user-specific data without manual input for each request.

By adhering to the specified parameter inclusion methods, you can effectively utilize the Auth service's API endpoints. For detailed information on each endpoint, including required parameters and their accepted locations, refer to the individual API definitions below.

### Common Parameters

The `Auth` service's routes support several common parameters designed to modify and enhance the behavior of API requests. These parameters are not individually listed in the API route definitions to avoid repetition. Instead, refer to this section to understand how to leverage these common behaviors across different routes. Note that all common parameters should be included in the query part of the URL.

### Supported Common Parameters:

- **getJoins (BOOLEAN)**: Controls whether to retrieve associated objects along with the main object. By default, `getJoins` is assumed to be `true`. Set it to `false` if you prefer to receive only the main fields of an object, excluding its associations.

- **excludeCQRS (BOOLEAN)**: Applicable only when `getJoins` is `true`. By default, `excludeCQRS` is set to `false`. Enabling this parameter (`true`) omits non-local associations, which are typically more resource-intensive as they require querying external services like ElasticSearch for additional information. Use this to optimize response times and resource usage.

- **requestId (String)**: Identifies a request to enable tracking through the service's log chain. A random hex string of 32 characters is assigned by default. If you wish to use a custom `requestId`, simply include it in your query parameters.

- **caching (BOOLEAN)**: Determines the use of caching for query routes. By default, caching is enabled (`true`). To ensure the freshest data directly from the database, set this parameter to `false`, bypassing the cache.

- **cacheTTL (Integer)**: Specifies the Time-To-Live (TTL) for query caching, in seconds. This is particularly useful for adjusting the default caching duration (5 minutes) for `get list` queries. Setting a custom `cacheTTL` allows you to fine-tune the cache lifespan to meet your needs.

- **pageNumber (Integer)**: For paginated `get list` routes, this parameter selects which page of results to retrieve. The default is `1`, indicating the first page. To disable pagination and retrieve all results, set `pageNumber` to `0`.

- **pageRowCount (Integer)**: In conjunction with paginated routes, this parameter defines the number of records per page. The default value is `25`. Adjusting `pageRowCount` allows you to control the volume of data returned in a single request.

By utilizing these common parameters, you can tailor the behavior of API requests to suit your specific requirements, ensuring optimal performance and usability of the `Auth` service.


  ### Multi Tenant Architecture

  The `Auth` service operates within a multi tenant architecture.
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
    - **Tenant Registration**: The `Auth` service allows for the creation of new tenants only through admin account of the root tenant. So if a new store record is needed, the superadmin or admin roles of the root should create then new tenant and assign any user as the owner of it.
  
  #### Implementation:

  When the user logins there may be few ways for Mindbricks to recognize and set the tenant id in the session.
  1. Mindbricks will check the url of the login request if it matches tenant url.
  2. Mindbricks will check the `` has the tenant id.
  3. Mindbricks will check if the user is associated with a `store` in the data model.
  After you login a tenant successfully, ensure that your requests accurately target objects that fall within the tenant scope set during the login session.
  Ensure your requests are correctly formatted to include the domain sandbox information in the header. This enables the `Auth` service to accurately identify the domain context, facilitating proper access control and data management based on the user's permissions and the specified domain.  
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
  By adhering to this domain sandbox model, the `Auth` service maintains a secure and organized structure for handling requests across different domains, ensuring that operations are performed within the correct contextual boundaries.

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

When the `Auth` service processes requests successfully, it wraps the requested resource(s) within a JSON envelope. This envelope not only contains the data but also includes essential metadata, such as configuration details and pagination information, to enrich the response and provide context to the client.

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
Auth service provides the following resources which are stored in its own database as a data object. Note that a resource for an api access is a data object for the service.

### User resource

*Resource Definition* : A data object that stores the user information and handles login settings.
*User Resource Properties* 
| Name | Type | Required | Default | Definition | 
| ---- | ---- | -------- | ------- | ---------- |
| **email** | String |  |  | * A string value to represent the user&#39;s email.* |
| **password** | String |  |  | * A string value to represent the user&#39;s password. It will be stored as hashed.* |
| **fullname** | String |  |  | *A string value to represent the fullname of the user* |
| **avatar** | String |  |  | *The avatar url of the user. A random avatar will be generated if not provided* |
| **emailVerified** | Boolean |  |  | *A boolean value to represent the email verification status of the user.* |
| **storeId** | ID |  |  | *An ID value to represent the tenant id of the store* |
### UserGroup resource

*Resource Definition* : A data object that stores the user group information.
*UserGroup Resource Properties* 
| Name | Type | Required | Default | Definition | 
| ---- | ---- | -------- | ------- | ---------- |
| **groupName** | String |  |  | * A string value to represent the group name.* |
| **avatar** | String |  |  | * A string value to represent the groups icon.* |
### UserGroupMember resource

*Resource Definition* : A data object that stores the members of the user group.
*UserGroupMember Resource Properties* 
| Name | Type | Required | Default | Definition | 
| ---- | ---- | -------- | ------- | ---------- |
| **groupId** | ID |  |  | * An ID value to represent the group that the user is asssigned as a memeber to.* |
| **userId** | ID |  |  | * An ID value to represent the user that is assgined as a member to the group.* |
| **ownerId** | ID |  |  | *An ID value to represent the admin user who assgined the member.* |
### Store resource

*Resource Definition* : A data object that stores the information for store
*Store Resource Properties* 
| Name | Type | Required | Default | Definition | 
| ---- | ---- | -------- | ------- | ---------- |
| **name** | String |  |  | *A string value to represent one word name of the store* |
| **codename** | String |  |  | *A string value to represent a unique code name for the store which is generated automatically using name* |
| **fullname** | String |  |  | *A string value to represent the fullname of the store* |
| **avatar** | String |  |  | *A string value represent the url of the store avatar. Keep null for random avatar.* |
| **ownerId** | ID |  |  | *An ID value to represent the user id of store owner who created the tenant* |
## Crud Routes
### Route: createUser
*Route Definition* : This route is used by admin roles to create a new user manually from admin panels

*Route Type* : create

*Default access route* : *POST* `/users`

####  Parameters
The createUser api has got 4 parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| avatar  | String  | false | request.body?.avatar |
| email  | String  | true | request.body?.email |
| password  | String  | true | request.body?.password |
| fullname  | String  | true | request.body?.fullname |

  

  



To access the api you can use the **REST** controller with the path **POST  /users**
```js
  axios({
    method: 'POST',
    url: '/users',
    data: {
            avatar:"String",  
            email:"String",  
            password:"String",  
            fullname:"String",  
    
    },
    params: {
    
    }
  });
```     
The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`user`** object in the respones. However, some properties may be omitted based on the object's internal logic.



```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"create","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  


  

### Route: updateUser
*Route Definition* : This route is used by users to update their profiles.

*Route Type* : update

*Default access route* : *PATCH* `/users/:userId`

####  Parameters
The updateUser api has got 3 parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| userId  | ID  | true | request.params?.userId |
| fullname  | String  | false | request.body?.fullname |
| avatar  | String  | false | request.body?.avatar |

  

  



To access the api you can use the **REST** controller with the path **PATCH  /users/:userId**
```js
  axios({
    method: 'PATCH',
    url: `/users/${userId}`,
    data: {
            fullname:"String",  
            avatar:"String",  
    
    },
    params: {
    
    }
  });
```     
The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`user`** object in the respones. However, some properties may be omitted based on the object's internal logic.



```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"update","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  


  

### Route: deleteUser
*Route Definition* : This route is used by users to delete their profiles.

*Route Type* : delete

*Default access route* : *DELETE* `/users/:userId`

####  Parameters
The deleteUser api has got 1 parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| userId  | ID  | true | request.params?.userId |

  

  



To access the api you can use the **REST** controller with the path **DELETE  /users/:userId**
```js
  axios({
    method: 'DELETE',
    url: `/users/${userId}`,
    data: {
    
    },
    params: {
    
    }
  });
```     
The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`user`** object in the respones. However, some properties may be omitted based on the object's internal logic.



```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"delete","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":false}}
```  


  

### Route: updateUserRole
*Route Definition* : This route is used by admin roles to update the user role.The default role is tenantUser when a tenant user is registered. A tenant user&#39;s role can be updated by tenantAdmin, while saas user&#39;s role is updated by superAdmin or saasAdmin

*Route Type* : update

*Default access route* : *PATCH* `/userrole/:userId`

####  Parameters
The updateUserRole api has got 2 parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| userId  | ID  | true | request.params?.userId |
| roleId  | String  | true | request.body?.roleId |

  

  

To access the route the session should validated across these validations.





```js
/* 
Validation Check: Check if the logged in user has [superAdmin-tenantAdmin] roles
This validation will be executed on layer1
*/
  if (!(this.userHasRole(this.ROLES.superAdmin) || this.userHasRole(this.ROLES.tenantAdmin))) {
  throw (new ForbiddenError("errMsg_userShoudlHave[superAdmin-tenantAdmin]RoleToAccessRoute"))
};

``` 



To access the api you can use the **REST** controller with the path **PATCH  /userrole/:userId**
```js
  axios({
    method: 'PATCH',
    url: `/userrole/${userId}`,
    data: {
            roleId:"String",  
    
    },
    params: {
    
    }
  });
```     
The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`user`** object in the respones. However, some properties may be omitted based on the object's internal logic.



```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"update","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  


  

### Route: updatePassword
*Route Definition* : This route is used to to force the password update by old passwrod.

*Route Type* : update

*Default access route* : *PATCH* `/password/:userId`

####  Parameters
The updatePassword api has got 3 parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| userId  | ID  | true | request.params?.userId |
| oldPassword  | String  | true | request.body?.oldPassword |
| newPassword  | String  | true | request.body?.newPassword |

  

  

To access the route the session should validated across these validations.





```js
/* 
Validation Check: Check if the current password mathces the old password. It is done after the instance is fetched.
This validation will be executed on layer3
*/
  if (!this.hashCompare(this.user.password,this.oldPassword)) {
  throw (new ForbiddenError("errMsg_TheOldPasswordDoesNotMatch"))
};

``` 



To access the api you can use the **REST** controller with the path **PATCH  /password/:userId**
```js
  axios({
    method: 'PATCH',
    url: `/password/${userId}`,
    data: {
            oldPassword:"String",  
            newPassword:"String",  
    
    },
    params: {
    
    }
  });
```     
The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`user`** object in the respones. However, some properties may be omitted based on the object's internal logic.



```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"update","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  


  

### Route: registerTenantUser
*Route Definition* : This route is used by public users to register themselves to tenants that are created by tenant owners.

*Route Type* : create

*Default access route* : *POST* `/registertenantuser`

####  Parameters
The registerTenantUser api has got 5 parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| socialCode  | String  | false | request.body?.socialCode |
| password  | String  | true | request.body?.password |
| fullname  | String  | true | request.body?.fullname |
| email  | String  | true | request.body?.email |
| avatar  | String  | false | request.body?.avatar |

  

  



To access the api you can use the **REST** controller with the path **POST  /registertenantuser**
```js
  axios({
    method: 'POST',
    url: '/registertenantuser',
    data: {
            socialCode:"String",  
            password:"String",  
            fullname:"String",  
            email:"String",  
            avatar:"String",  
    
    },
    params: {
    
    }
  });
```     
The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`user`** object in the respones. However, some properties may be omitted based on the object's internal logic.



```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"create","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  


  

### Route: registerStoreOwner
*Route Definition* : This route is used by public users to register themselves as tenant owners to create both a user account and a store account they own.

*Route Type* : create

*Default access route* : *POST* `/registerstoreowner`

####  Parameters
The registerStoreOwner api has got 5 parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| avatar  | String  | false | request.body?.avatar |
| socialCode  | String  | false | request.body?.socialCode |
| password  | String  | true | request.body?.password |
| fullname  | String  | true | request.body?.fullname |
| email  | String  | true | request.body?.email |

  

  



To access the api you can use the **REST** controller with the path **POST  /registerstoreowner**
```js
  axios({
    method: 'POST',
    url: '/registerstoreowner',
    data: {
            avatar:"String",  
            socialCode:"String",  
            password:"String",  
            fullname:"String",  
            email:"String",  
    
    },
    params: {
    
    }
  });
```     
The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`user`** object in the respones. However, some properties may be omitted based on the object's internal logic.


  Given that this create route features shortcuts for creating or updating child objects, the response will also encompass the outcomes of these child operations. It's important to note, though, that this includes only newly created or updated children. For a comprehensive list of all child objects, please utilize a corresponding GET route.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"create","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  


  

### Route: getUser
*Route Definition* : This route is used by admin roles or the users themselves to get the user profile information.

*Route Type* : get

*Default access route* : *GET* `/users/:userId`

####  Parameters
The getUser api has got 1 parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| userId  | ID  | true | request.params?.userId |

  

  



To access the api you can use the **REST** controller with the path **GET  /users/:userId**
```js
  axios({
    method: 'GET',
    url: `/users/${userId}`,
    data: {
    
    },
    params: {
    
    }
  });
```     
The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`user`** object in the respones. However, some properties may be omitted based on the object's internal logic.



```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"get","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  


  

### Route: listUsers
*Route Definition* : The list of users is filtered by the tenantId.

*Route Type* : getList

*Default access route* : *GET* `/users`

The listUsers api has got no parameters.    

  

  



To access the api you can use the **REST** controller with the path **GET  /users**
```js
  axios({
    method: 'GET',
    url: '/users',
    data: {
    
    },
    params: {
    
    }
  });
```     
The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`users`** object in the respones. However, some properties may be omitted based on the object's internal logic.



```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"users","action":"getList","appVersion":"Version","rowCount":"\"Number\"","users":[{"id":"ID","isActive":true},{},{}],"paging":{"pageNumber":"Number","pageRowCount":"NUmber","totalRowCount":"Number","pageCount":"Number"},"filters":[],"uiPermissions":[]}
```  


  

### Route: createGroup
*Route Definition* : This route is used by admin roles to create a new usergroup manually from admin panels

*Route Type* : create

*Default access route* : *POST* `/group`

####  Parameters
The createGroup api has got 2 parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| avatar  | String  | false | request.body?.avatar |
| groupName  | String  | true | request.body?.groupName |

  

  

To access the route the session should validated across these validations.





```js
/* 
Validation Check: Check if the logged in user has [superAdmin-admin-saasAdmin] roles
This validation will be executed on layer1
*/
  if (!(this.userHasRole(this.ROLES.superAdmin) || this.userHasRole(this.ROLES.admin) || this.userHasRole(this.ROLES.saasAdmin))) {
  throw (new ForbiddenError("errMsg_userShoudlHave[superAdmin-admin-saasAdmin]RoleToAccessRoute"))
};

``` 



To access the api you can use the **REST** controller with the path **POST  /group**
```js
  axios({
    method: 'POST',
    url: '/group',
    data: {
            avatar:"String",  
            groupName:"String",  
    
    },
    params: {
    
    }
  });
```     
The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`userGroup`** object in the respones. However, some properties may be omitted based on the object's internal logic.



```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroup","action":"create","appVersion":"Version","rowCount":1,"userGroup":{"id":"ID","isActive":true}}
```  


  

### Route: updateGroup
*Route Definition* : This route is used by admin to update user groups.

*Route Type* : update

*Default access route* : *PATCH* `/group/:userGroupId`

####  Parameters
The updateGroup api has got 3 parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| userGroupId  | ID  | true | request.params?.userGroupId |
| groupName  | String  | false | request.body?.groupName |
| avatar  | String  | false | request.body?.avatar |

  

  



To access the api you can use the **REST** controller with the path **PATCH  /group/:userGroupId**
```js
  axios({
    method: 'PATCH',
    url: `/group/${userGroupId}`,
    data: {
            groupName:"String",  
            avatar:"String",  
    
    },
    params: {
    
    }
  });
```     
The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`userGroup`** object in the respones. However, some properties may be omitted based on the object's internal logic.



```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroup","action":"update","appVersion":"Version","rowCount":1,"userGroup":{"id":"ID","isActive":true}}
```  


  

### Route: getGroup
*Route Definition* : This route is used by admin roles or the users to get the user group information.

*Route Type* : get

*Default access route* : *GET* `/group/:userGroupId`

####  Parameters
The getGroup api has got 1 parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| userGroupId  | ID  | true | request.params?.userGroupId |

  

  



To access the api you can use the **REST** controller with the path **GET  /group/:userGroupId**
```js
  axios({
    method: 'GET',
    url: `/group/${userGroupId}`,
    data: {
    
    },
    params: {
    
    }
  });
```     
The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`userGroup`** object in the respones. However, some properties may be omitted based on the object's internal logic.



```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroup","action":"get","appVersion":"Version","rowCount":1,"userGroup":{"id":"ID","isActive":true}}
```  


  

### Route: listGroups
*Route Definition* : This route is used by admin or user roles to get the list of groups.

*Route Type* : getList

*Default access route* : *GET* `/groups`

The listGroups api has got no parameters.    

  

  



To access the api you can use the **REST** controller with the path **GET  /groups**
```js
  axios({
    method: 'GET',
    url: '/groups',
    data: {
    
    },
    params: {
    
    }
  });
```     
The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`userGroups`** object in the respones. However, some properties may be omitted based on the object's internal logic.



```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroups","action":"getList","appVersion":"Version","rowCount":"\"Number\"","userGroups":[{"id":"ID","isActive":true},{},{}],"paging":{"pageNumber":"Number","pageRowCount":"NUmber","totalRowCount":"Number","pageCount":"Number"},"filters":[],"uiPermissions":[]}
```  


  

### Route: createGroupMember
*Route Definition* : This route is used by admin roles to add a user to a group.

*Route Type* : create

*Default access route* : *POST* `/groupmember`

####  Parameters
The createGroupMember api has got 2 parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| groupId  | ID  | true | request.body?.groupId |
| userId  | ID  | true | request.body?.userId |

  

  

To access the route the session should validated across these validations.





```js
/* 
Validation Check: Check if the logged in user has [superAdmin-admin-saasAdmin] roles
This validation will be executed on layer1
*/
  if (!(this.userHasRole(this.ROLES.superAdmin) || this.userHasRole(this.ROLES.admin) || this.userHasRole(this.ROLES.saasAdmin))) {
  throw (new ForbiddenError("errMsg_userShoudlHave[superAdmin-admin-saasAdmin]RoleToAccessRoute"))
};

``` 



To access the api you can use the **REST** controller with the path **POST  /groupmember**
```js
  axios({
    method: 'POST',
    url: '/groupmember',
    data: {
            groupId:"ID",  
            userId:"ID",  
    
    },
    params: {
    
    }
  });
```     
The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`userGroupMember`** object in the respones. However, some properties may be omitted based on the object's internal logic.



```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroupMember","action":"create","appVersion":"Version","rowCount":1,"userGroupMember":{"id":"ID","isActive":true}}
```  


  

### Route: deleteGroupMember
*Route Definition* : This route is used by admin to delete a member from a group.

*Route Type* : delete

*Default access route* : *DELETE* `/groupmember/:userGroupMemberId`

####  Parameters
The deleteGroupMember api has got 1 parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| userGroupMemberId  | ID  | true | request.params?.userGroupMemberId |

  

  



To access the api you can use the **REST** controller with the path **DELETE  /groupmember/:userGroupMemberId**
```js
  axios({
    method: 'DELETE',
    url: `/groupmember/${userGroupMemberId}`,
    data: {
    
    },
    params: {
    
    }
  });
```     
The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`userGroupMember`** object in the respones. However, some properties may be omitted based on the object's internal logic.



```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroupMember","action":"delete","appVersion":"Version","rowCount":1,"userGroupMember":{"id":"ID","isActive":false}}
```  


  

### Route: getGroupMember
*Route Definition* : This route is used by admin roles or the users to get the user group member information.

*Route Type* : get

*Default access route* : *GET* `/groupmember/:userGroupMemberId`

####  Parameters
The getGroupMember api has got 1 parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| userGroupMemberId  | ID  | true | request.params?.userGroupMemberId |

  

  



To access the api you can use the **REST** controller with the path **GET  /groupmember/:userGroupMemberId**
```js
  axios({
    method: 'GET',
    url: `/groupmember/${userGroupMemberId}`,
    data: {
    
    },
    params: {
    
    }
  });
```     
The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`userGroupMember`** object in the respones. However, some properties may be omitted based on the object's internal logic.



```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroupMember","action":"get","appVersion":"Version","rowCount":1,"userGroupMember":{"id":"ID","isActive":true}}
```  


  

### Route: listGroupMembers
*Route Definition* : This route is used by admin or user roles to get the list of group members of a group.

*Route Type* : getList

*Default access route* : *GET* `/groupmembers`

####  Parameters
The listGroupMembers api has got 1 parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| groupId  | ID  | true | request.query?.groupId |

  

  



To access the api you can use the **REST** controller with the path **GET  /groupmembers**
```js
  axios({
    method: 'GET',
    url: '/groupmembers',
    data: {
    
    },
    params: {
             groupId:'"ID"',  
    
    }
  });
```     
The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`userGroupMembers`** object in the respones. However, some properties may be omitted based on the object's internal logic.



```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroupMembers","action":"getList","appVersion":"Version","rowCount":"\"Number\"","userGroupMembers":[{"id":"ID","isActive":true},{},{}],"paging":{"pageNumber":"Number","pageRowCount":"NUmber","totalRowCount":"Number","pageCount":"Number"},"filters":[],"uiPermissions":[]}
```  


  

### Route: createStore
*Route Definition* : This route is used by Saas Admin to create a tenant (Store) manually without public registration. After creating the tenant, a user should be updated to be owner of this tenant.

*Route Type* : create

*Default access route* : *POST* `/stores`

####  Parameters
The createStore api has got 3 parameters  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| avatar  | String  |  | request.body?.avatar |
| name  | String  | true | request.body?.name |
| fullname  | String  | true | request.body?.fullname |

  

  

To access the route the session should validated across these validations.





```js
/* 
Validation Check: Check if the logged in user has [superAdmin-saasAdmin] roles
This validation will be executed on layer1
*/
  if (!(this.userHasRole(this.ROLES.superAdmin) || this.userHasRole(this.ROLES.saasAdmin))) {
  throw (new ForbiddenError("errMsg_userShoudlHave[superAdmin-saasAdmin]RoleToAccessRoute"))
};

``` 



To access the api you can use the **REST** controller with the path **POST  /stores**
```js
  axios({
    method: 'POST',
    url: '/stores',
    data: {
            avatar:"String",  
            name:"String",  
            fullname:"String",  
    
    },
    params: {
    
    }
  });
```     
The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`store`** object in the respones. However, some properties may be omitted based on the object's internal logic.



```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"store","action":"create","appVersion":"Version","rowCount":1,"store":{"id":"ID","isActive":true}}
```  


  

### Route: getStore
*Route Definition* : Get a store by id. A public route which can be called without login

*Route Type* : get

*Default access route* : *GET* `/stores/:storeId`

####  Parameters
The getStore api has got 1 parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| storeId  | ID  | true | request.params?.storeId |

  

  



To access the api you can use the **REST** controller with the path **GET  /stores/:storeId**
```js
  axios({
    method: 'GET',
    url: `/stores/${storeId}`,
    data: {
    
    },
    params: {
    
    }
  });
```     
The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`store`** object in the respones. However, some properties may be omitted based on the object's internal logic.



```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"store","action":"get","appVersion":"Version","rowCount":1,"store":{"id":"ID","isActive":true}}
```  


  

### Route: getStoreByCodename
*Route Definition* : Get store by codename to use the i in the header to make tenant specific calls. A public route which can be called without login

*Route Type* : get

*Default access route* : *GET* `/storebycodename/:codename`

####  Parameters
The getStoreByCodename api has got 1 parameter  

| Parameter              | Type                   | Required | Population                   |
| ---------------------- | ---------------------- | -------- | ---------------------------- |
| codename  | String  | true | request.params?.codename |

  

  



To access the api you can use the **REST** controller with the path **GET  /storebycodename/:codename**
```js
  axios({
    method: 'GET',
    url: `/storebycodename/${codename}`,
    data: {
    
    },
    params: {
    
    }
  });
```     
The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`store`** object in the respones. However, some properties may be omitted based on the object's internal logic.



```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"store","action":"get","appVersion":"Version","rowCount":1,"store":{"id":"ID","isActive":true}}
```  


  

### Route: listRegisteredStores
*Route Definition* : Get a list of stores, this route can be called by saas user and closed in tenant level

*Route Type* : getList

*Default access route* : *GET* `/registeredstores`

The listRegisteredStores api has got no parameters.    

  

  



To access the api you can use the **REST** controller with the path **GET  /registeredstores**
```js
  axios({
    method: 'GET',
    url: '/registeredstores',
    data: {
    
    },
    params: {
    
    }
  });
```     
The API response is encapsulated within a JSON envelope. Successful operations return an HTTP status code of 200 for get, getlist, update, or delete requests, and 201 for create requests. Each successful response includes a `"status": "OK"` property. For error handling, refer to the "Error Response" section.

Following JSON represents the most comprehensive form of the **`stores`** object in the respones. However, some properties may be omitted based on the object's internal logic.



```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"stores","action":"getList","appVersion":"Version","rowCount":"\"Number\"","stores":[{"id":"ID","isActive":true},{},{}],"paging":{"pageNumber":"Number","pageRowCount":"NUmber","totalRowCount":"Number","pageCount":"Number"},"filters":[],"uiPermissions":[]}
```  


  



### Authentication Specific Routes


  ### Route: login

  *Route Definition*: Handles the login process by verifying user credentials and generating an authenticated session.
  
  *Route Type*: login
  
  *Access Routes*:
  - `GET /login`: Returns the HTML login page
  (not a frontend module, typically used in browser-based contexts for test purpose to make sending POST /login easier).
  - `POST /login`: Accepts credentials, verifies the user, creates a session, and returns a JWT access token.
  
  #### Parameters
  
  | Parameter   | Type     | Required | Population                  |
  |-------------|----------|----------|-----------------------------|
  | username    | String   | Yes      | `request.body.username`     |
  | password    | String   | Yes      | `request.body.password`     |
  
  #### Notes
  
  - This route accepts login credentials and creates an authenticated session if credentials are valid.
  - On success, the response will:
    - Set a cookie named `projectname-access-token[-tenantCodename]` with the JWT token.
    - Include the token in the response headers under the same name.
    - Return the full `session` object in the JSON body.
    - Note that `username` parameter should have the email of the user as value.
    You can also send an `email` parameter instead of `username` parameter. 
    If both sent only `username` parameter will be read.
  
  ```js
  // Sample POST /login call
  axios.post("/login", {
    username: "user@example.com",
    password: "securePassword"
  });
  ```
  
  **Success Response**
  
  Returns the authenticated session object with a status code `200 OK`.
  
  A secure HTTP-only cookie and an access token header are included in the response.
  
  ```jsom
  {
    "userId": "d92b9d4c-9b1e-4e95-842e-3fb9c8c1df38",
    "email": "user@example.com",
    "fullname": "John Doe",
    ...
  }
  ```
  
  **Error Responses**
  * **401 Unauthorized:** Invalid username or password.
  * **403 Forbidden:** Login attempt rejected due to pending email/mobile verification or 2FA requirements.
  * **400 Bad Request:** Missing credentials in the request.
  
  ### Route: logout
  
  *Route Definition*: Logs the user out by terminating the current session and clearing the access token.
  
  *Route Type*: logout
  
  *Access Route*: `POST /logout`
  
  #### Parameters
  
  This route does not require any parameters in the body or query.
  
  #### Behavior
  
  - Invalidates the current session on the server (if stored).
  - Clears the access token cookie (`projectname-access-token[-tenantCodename]`) from the client.
  - Responds with a 200 status and a simple confirmation object.
  
  ```js
  // Sample POST /logout call
  axios.post("/logout", {}, {
    headers: {
      "Authorization": "Bearer your-jwt-token"
    }
  });
  ```
  
  **Notes**
  * This route is public, meaning it can be called without a session or token.
  * If the session is active, the server will clear associated session state and cookies.
  * The logout behavior may vary slightly depending on whether you're using cookie-based or header-based token management.
  
  **Error Responses**
  00200 OK:** Always returned, regardless of whether a session existed.
  Logout is treated as idempotent.
  
  ### Route: publickey
  
  *Route Definition*: Returns the public RSA key used to verify JWT access tokens issued by the auth service.
  
  *Route Type*: publicKeyFetch
  
  *Access Route*: `GET /publickey`
  
  #### Parameters
  
  | Parameter | Type   | Required | Population         |
  |-----------|--------|----------|--------------------|
  | keyId     | String | No       | `request.query.keyId` |
  
  - `keyId` is optional.  
    If provided, retrieves the public key corresponding to the specific `keyId`.  
    If omitted, retrieves the current active public key (`global.currentKeyId`).
  
  #### Behavior
  
  - Reads the requested RSA public key file from the server filesystem.
  - If the key exists, returns it along with its `keyId`.
  - If the key does not exist, returns a 404 error.
  
  ```js
  // Sample GET /publickey call
  axios.get("/publickey", {
    params: {
      keyId: "currentKeyIdOptional"
    }
  });
  ```
  
  **Success Response**
  Returns the active public key and its associated keyId.
  ```json
  {
      "keyId": "a1b2c3d4",
      "keyData": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhki...\n-----END PUBLIC KEY-----"
  }
  ````
  **Error Responses**
  **404 Not Found:** Public key file could not be found on the server.
  
  ### Token Key Management
  
  Mindbricks uses RSA key pairs to sign and verify JWT access tokens securely.  
  While the auth service signs each token with a private key, other services within the system — or external clients — need the corresponding **public key** to verify the authenticity and integrity of received tokens.
  
  The `/publickey` endpoint allows services and clients to dynamically fetch the currently active public key, ensuring that token verification remains secure even if key rotation is performed.
  
  > **Note**:  
  > The `/publickey` route is not intended for direct frontend (browser) consumption.  
  > Instead, it is primarily used by trusted backend services, APIs, or middleware systems that need to independently verify access tokens issued by the auth service — without making verification-dependent API calls to the auth service itself.
  
  Accessing the public key is crucial for validating user sessions efficiently and maintaining a decentralized trust model across your platform.
  
  ### Route: linksession
  
  *Route Definition*: Allows manually linking an access token to a browser session by setting it as an HTTP-only cookie.
  
  *Route Type*: devUtility
  
  *Access Route*: `GET /linksession?token=ACCESS_TOKEN`
  
  #### Parameters
  
  | Parameter | Type   | Required | Description                          |
  |-----------|--------|----------|--------------------------------------|
  | token     | String | Yes      | A valid access token (JWT) to link to the session |
  
  #### Behavior
  
  - Accepts a valid access token (`token`) via query string.
  - Writes the token to a secure HTTP-only cookie on the response.
  - Enables the browser to use this token automatically for subsequent API requests (like `/currentuser` or any protected route).
  - Returns basic info confirming the operation.
  
  ```js
  // Sample usage (e.g., in dev/test environment)
  axios.get("/linksession?token=your-access-token");
  ```
  **Success Response**
  
  ```json
  {
    "cookieName": "myapp-access-token",
    "accessToken": "your-access-token",
    "domain": "your-api-domain.com",
    "currentuser": "https://your-api-domain.com/currentuser"
  }
  
  ```
  
  **Error Responses**
  * **401 Unauthorized**: Malformed request or internal error.
  
  ```json
  {
    "status": "ERR",
    "message": "Invalid or missing token"
  }
  ```
  
  **Notes**
  
  - Use case: This route is designed primarily for test and development purposes.
  - It enables developers to paste or pass a token into the browser and simulate an authenticated session using cookie-based access.
  - After calling /linksession, you can immediately query /currentuser or any secured endpoint from the same browser session.
  
  > ⚠️ This route is disabled in production environments, as it provides manual token injection via query parameters.
  
  ### Route: relogin
  
  *Route Definition*: Performs a silent login by verifying the current access token, refreshing the session, and returning a new access token along with updated user information.
  
  *Route Type*: sessionRefresh
  
  *Access Route*: `GET /relogin`
  
  #### Parameters
  
  This route does **not** require any request parameters.
  
  #### Behavior
  
  - Validates the access token associated with the request.
  - If the token is valid:
    - Re-authenticates the user using the session's user ID.
    - Fetches the most up-to-date user information from the database.
    - Generates a new session object with a **new session ID** and **new access token**.
  - If the token is invalid or missing, returns a 401 Unauthorized error.
  
  ```js
  // Example call to refresh session
  axios.get("/relogin", {
    headers: {
      "Authorization": "Bearer your-jwt-token"
    }
  });
  ```
  **Success Response**
  Returns a new session object, refreshed from database data.
  ```json
  {
    "sessionId": "new-session-uuid",
    "userId": "user-uuid",
    "email": "user@example.com",
    "roleId": "admin",
    "accessToken": "new-jwt-token",
    ...
  }
  ```
  **Error Responses**
  * **401 Unauthorized**: Token is missing, invalid, or session cannot be re-established.
  ```json
  {
    "status": "ERR",
    "message": "Cannot relogin"
  }
  ```
  
  **Notes**
  
  - The `/relogin` route is commonly used for **silent login flows**, especially after page reloads or token-based auto-login mechanisms.
  - It triggers internal logic (`req.userAuthUpdate = true`) to signal that the session should be re-initialized and repopulated.
  - It is not a simple session lookup — it performs a fresh authentication pass using the session's user context.
  - The refreshed session ensures any updates to user profile, roles, or permissions are immediately reflected.
  
  > **Tip:**
  > This route is ideal when you want to **rebuild a user's session** in the frontend without requiring them to manually log in again.
  
  ## Verification Services — Email Verification
  
  Email verification is a two-step flow that ensures a user's email address is verified and trusted by the system.
  
  All verification services, including email verification, are located under the `/verification-services` base path.
  
  ### When is Email Verification Triggered?
  
  - After user registration, if `emailVerificationRequiredForLogin` is active.
  - During a separate user action to verify or update email addresses.
  - When login fails with `EmailVerificationNeeded` and frontend initiates verification.
  
  ### Email Verification Flow
  
  1. **Frontend calls `/verification-services/email-verification/start`** with the user's email address.
     - Mindbricks checks if the email is already verified.
     - A secret code is generated and stored in the cache linked to the user.
     - The code is sent to the user's email or returned in the response (only in development environments for easier testing).
  2. **User receives the code and enters it into the frontend application.**
  3. **Frontend calls `/verification-services/email-verification/complete`** with the `userId` and the received `secretCode`.
     - Mindbricks checks that the code is valid, not expired, and matches.
     - If valid, the user’s `emailVerified` flag is set to `true`, and a success response is returned.
  
  ---
  
  ## API Endpoints
  
  ### POST `/verification-services/email-verification/start`
  
  **Purpose**  
  Starts the email verification process by generating and sending a secret verification code.
  
  #### Request Body
  
  | Parameter | Type   | Required | Description                 |
  |-----------|--------|----------|-----------------------------|
  | email     | String | Yes      | The email address to verify |
  
  ```json
  {
    "email": "user@example.com"
  }
  ```
  
  #### Success Response
  
  Secret code details (in development environment). Confirms that the verification step has been started.
  
  ```json
  {
    "userId": "user-uuid",
    "email": "user@example.com",
    "secretCode": "123456",
    "expireTime": 86400,
    "date": "2024-04-29T10:00:00.000Z"
  }
  ```
  
  > ⚠️ In production, the secret code is only sent via email, not exposed in the API response.
  
  #### Error Responses
  
  - `400 Bad Request`: Email already verified.
  - `403 Forbidden`: Sending a code too frequently (anti-spam).
  
  ---
  
  ### POST `/verification-services/email-verification/complete`
  
  **Purpose**  
  Completes the email verification by validating the secret code.
  
  #### Request Body
  
  | Parameter   | Type   | Required | Description                         |
  |-------------|--------|----------|-------------------------------------|
  | userId      | String | Yes      | The user's ID whose email is being verified |
  | secretCode  | String | Yes      | The secret code received via email |
  
  ```json
  {
    "userId": "user-uuid",
    "secretCode": "123456"
  }
  ```
  
  #### Success Response
  
  Returns confirmation that the email has been verified.
  
  ```json
  {
    "userId": "user-uuid",
    "email": "user@example.com",
    "isVerified": true
  }
  ```
  
  #### Error Responses
  
  - `403 Forbidden`:
    - Secret code mismatch
    - Secret code expired
    - No ongoing verification found
  
  ---
  
  ## Important Behavioral Notes
  
  ### Resend Throttling  
  You can only request a new verification code after a cooldown period (`resendTimeWindow`, e.g., 60 seconds).
  
  ### Expiration Handling  
  Verification codes expire after a configured period (`expireTimeWindow`, e.g., 1 day).
  
  ### One Code Per Session  
  Only one active verification session per user is allowed at a time.
  
  > 💡 Mindbricks automatically manages spam prevention, session caching, expiration, and event broadcasting (start/complete events) for all verification steps.
  
  ## Verification Services — Mobile Verification
  
  Mobile verification is a two-step flow that ensures a user's mobile number is verified and trusted by the system.
  
  All verification services, including mobile verification, are located under the `/verification-services` base path.
  
  ### When is Mobile Verification Triggered?
  
  - After user registration, if `mobileVerificationRequiredForLogin` is active.
  - During a separate user action to verify or update mobile numbers.
  - When login fails with `MobileVerificationNeeded` and frontend initiates verification.
  
  ### Mobile Verification Flow
  
  1. **Frontend calls `/verification-services/mobile-verification/start`** with the user's email address (used to locate the user).
     - Mindbricks checks if the mobile number is already verified.
     - A secret code is generated and stored in the cache linked to the user.
     - The code is sent to the user's mobile via SMS or returned in the response (only in development environments for easier testing).
  2. **User receives the code and enters it into the frontend application.**
  3. **Frontend calls `/verification-services/mobile-verification/complete`** with the `userId` and the received `secretCode`.
     - Mindbricks checks that the code is valid, not expired, and matches.
     - If valid, the user’s `mobileVerified` flag is set to `true`, and a success response is returned.
  
  ---
  
  ## API Endpoints
  
  ### POST `/verification-services/mobile-verification/start`
  
  **Purpose**:  
  Starts the mobile verification process by generating and sending a secret verification code.
  
  #### Request Body
  
  | Parameter | Type   | Required | Description                         |
  |-----------|--------|----------|-------------------------------------|
  | email     | String | Yes      | The email address associated with the mobile number to verify         |
  
  ```json
  {
    "email": "user@example.com"
  }
  ```
  
  **Success Response**  
  Secret code details (in development environment). Confirms that the verification step has been started.
  
  ```json
  {
    "userId": "user-uuid",
    "mobile": "+15551234567",
    "secretCode": "123456",
    "expireTime": 86400,
    "date": "2024-04-29T10:00:00.000Z"
  }
  ```
  
  ⚠️ In production, the secret code is only sent via SMS, not exposed in the API response.
  
  **Error Responses**  
  - 400 Bad Request: Mobile already verified.  
  - 403 Forbidden: Sending a code too frequently (anti-spam).
  
  ---
  
  ### POST `/verification-services/mobile-verification/complete`
  
  **Purpose**:  
  Completes the mobile verification by validating the secret code.
  
  #### Request Body
  
  | Parameter   | Type   | Required | Description                        |
  |-------------|--------|----------|------------------------------------|
  | userId      | String | Yes      | The user's ID whose mobile is being verified |
  | secretCode  | String | Yes      | The secret code received via SMS   |
  
  ```json
  {
    "userId": "user-uuid",
    "secretCode": "123456"
  }
  ```
  
  **Success Response**  
  Returns confirmation that the mobile number has been verified.
  
  ```json
  {
    "userId": "user-uuid",
    "mobile": "+15551234567",
    "isVerified": true
  }
  ```
  
  **Error Responses**  
  403 Forbidden:
  - Secret code mismatch  
  - Secret code expired  
  - No ongoing verification found
  
  ---
  
  ## Important Behavioral Notes
  
  **Resend Throttling**:  
  You can only request a new verification code after a cooldown period (`resendTimeWindow`, e.g., 60 seconds).
  
  **Expiration Handling**:  
  Verification codes expire after a configured period (`expireTimeWindow`, e.g., 1 day).
  
  **One Code Per Session**:  
  Only one active verification session per user is allowed at a time.
  
  💡 Mindbricks automatically manages spam prevention, session caching, expiration, and event broadcasting (start/complete events) for all verification steps.
  
  ## Verification Services — Email 2FA Verification
  
  Email 2FA (Two-Factor Authentication) provides an additional layer of security by requiring users to confirm their identity using a secret code sent to their email address. This process is used in login flows or sensitive actions that need extra verification.
  
  All verification services, including 2FA, are located under the `/verification-services` base path.
  
  ### When is Email 2FA Triggered?
  
  - During login flows where `sessionNeedsEmail2FA` is `true`
  - When the backend enforces two-factor authentication for a sensitive operation
  
  ### Email 2FA Flow
  
  1. **Frontend calls `/verification-services/email-2factor-verification/start`** with the user’s email address.
     - Mindbricks identifies the user and checks if a cooldown period applies.
     - A new secret code is generated and stored, linked to the current session ID.
     - The code is sent via email or returned in development environments.
  2. **User receives the code and enters it into the frontend application.**
  3. **Frontend calls `/verification-services/email-2factor-verification/complete`** with the `userId`, `sessionId`, and the `secretCode`.
     - Mindbricks verifies the code, validates the session, and updates the session to remove the 2FA requirement.
  
  ---
  
  ## API Endpoints
  
  ### POST `/verification-services/email-2factor-verification/start`
  
  **Purpose**:  
  Starts the email-based 2FA process by generating and sending a verification code.
  
  #### Request Body
  
  | Parameter | Type   | Required | Description                         |
  |-----------|--------|----------|-------------------------------------|
  | email     | String | Yes      | The email of the user               |
  
  ```json
  {
    "email": "user@example.com"
  }
  ```
  
  #### Success Response
  
  ```json
  {
    "sessionId": "session-uuid",
    "userId": "user-uuid",
    "email": "user@example.com",
    "secretCode": "123456",
    "expireTime": 300,
    "date": "2024-04-29T10:00:00.000Z"
  }
  ```
  
  ⚠️ In production, the `secretCode` is only sent via email, not exposed in the API response.
  
  #### Error Responses
  
  - **403 Forbidden**: Sending a code too frequently (anti-spam)
  - **401 Unauthorized**: User session not found
  
  ---
  
  ### POST `/verification-services/email-2factor-verification/complete`
  
  **Purpose**:  
  Completes the email 2FA process by validating the secret code and session.
  
  #### Request Body
  
  | Parameter   | Type   | Required | Description                                      |
  |-------------|--------|----------|--------------------------------------------------|
  | userId      | String | Yes      | The user’s ID                                    |
  | sessionId   | String | Yes      | The session ID the code is tied to              |
  | secretCode  | String | Yes      | The secret code received via email              |
  
  ```json
  {
    "userId": "user-uuid",
    "sessionId": "session-uuid",
    "secretCode": "123456"
  }
  ```
  
  #### Success Response
  
  Returns an updated session with 2FA disabled:
  
  ```json
  {
    "sessionId": "session-uuid",
    "userId": "user-uuid",
    "sessionNeedsEmail2FA": false,
    ...
  }
  ```
  
  #### Error Responses
  
  - **403 Forbidden**:  
    - Secret code mismatch  
    - Secret code expired  
    - Verification step not found  
  
  ---
  
  ### Important Behavioral Notes
  
  - **One Code Per Session**: Only one active code can be issued per session.
  - **Resend Throttling**: Code requests are throttled based on `resendTimeWindow` (e.g., 60 seconds).
  - **Expiration**: Codes expire after `expireTimeWindow` (e.g., 5 minutes).
  - 💡 Mindbricks manages session cache, spam control, expiration tracking, and event notifications for all 2FA steps.
  
  ## Verification Services — Mobile 2FA Verification
  
  Mobile 2FA (Two-Factor Authentication) is a security mechanism that adds an extra layer of authentication using a user's verified mobile number.
  
  All verification services, including mobile 2FA, are accessible under the `/verification-services` base path.
  
  ### When is Mobile 2FA Triggered?
  
  - During login or critical actions requiring step-up authentication.
  - When the session has a flag `sessionNeedsMobile2FA = true`.
  - When login or session verification fails with `MobileVerificationNeeded`, indicating 2FA is required.
  
  ### Mobile 2FA Verification Flow
  
  1. **Frontend calls `/verification-services/mobile-2factor-verification/start`** with the user's email address, client info, and reason.
     - Mindbricks finds the user by email.
     - Verifies that the user has a verified mobile number.
     - A secret code is generated and cached against the session.
     - The code is sent to the user's verified mobile number or returned in the response (only in development environments).
  2. **User receives the code and enters it in the frontend app.**
  3. **Frontend calls `/verification-services/mobile-2factor-verification/complete`** with the `userId`, `sessionId`, and `secretCode`.
     - Mindbricks validates the code for expiration and correctness.
     - If valid, the session flag `sessionNeedsMobile2FA` is cleared.
     - A refreshed session object is returned.
  
  ---
  
  ## API Endpoints
  
  ### POST `/verification-services/mobile-2factor-verification/start`
  
  **Purpose**:  
  Initiates mobile-based 2FA by generating and sending a secret code.
  
  #### Request Body
  
  | Parameter | Type   | Required | Description                                   |
  |-----------|--------|----------|-----------------------------------------------|
  | email     | String | Yes      | The user's email address                      |
  | client    | String | No       | Optional client tag or context                |
  | reason    | String | No       | Optional reason for triggering 2FA            |
  
  ```json
  {
    "email": "user@example.com",
    "client": "login-page",
    "reason": "Login requires mobile 2FA"
  }
  ```
  
  **Success Response**  
  Returns the generated code (only in development), expiration info, and metadata.
  
  ```json
  {
    "userId": "user-uuid",
    "sessionId": "session-uuid",
    "mobile": "+15551234567",
    "secretCode": "654321",
    "expireTime": 300,
    "date": "2024-04-29T11:00:00.000Z"
  }
  ```
  
  ⚠️ In production environments, the secret code is not included in the response and is instead delivered via SMS.
  
  **Error Responses**
  
  - 403 Forbidden: Mobile number not verified.
  - 403 Forbidden: Code resend attempted before cooldown period (`resendTimeWindow`).
  - 401 Unauthorized: Email not recognized or session invalid.
  
  ---
  
  ### POST `/verification-services/mobile-2factor-verification/complete`
  
  **Purpose**:  
  Completes mobile 2FA verification by validating the secret code and updating the session.
  
  #### Request Body
  
  | Parameter   | Type   | Required | Description                         |
  |-------------|--------|----------|-------------------------------------|
  | userId      | String | Yes      | ID of the user                      |
  | sessionId   | String | Yes      | ID of the session                   |
  | secretCode  | String | Yes      | The 6-digit code received via SMS   |
  
  ```json
  {
    "userId": "user-uuid",
    "sessionId": "session-uuid",
    "secretCode": "654321"
  }
  ```
  
  **Success Response**  
  Returns the updated session with `sessionNeedsMobile2FA: false`.
  
  ```json
  {
    "sessionId": "session-uuid",
    "userId": "user-uuid",
    "sessionNeedsMobile2FA": false,
    "accessToken": "jwt-token",
    "expiresIn": 86400
  }
  ```
  
  **Error Responses**
  
  - 403 Forbidden: Code mismatch or expired.
  - 403 Forbidden: No ongoing verification found.
  - 401 Unauthorized: Session does not exist or is invalid.
  
  ---
  
  ### Behavioral Notes
  
  - **Rate Limiting**: A user can only request a new mobile 2FA code after the cooldown period (`resendTimeWindow`, e.g., 60 seconds).
  - **Expiration**: Mobile 2FA codes expire after the configured time (`expireTimeWindow`, e.g., 5 minutes).
  - **Session Integrity**: Verification status is tied to the session; incorrect sessionId will invalidate the attempt.
  
  💡 Mindbricks handles session integrity, rate limiting, and secure code delivery to ensure a robust mobile 2FA process.
  
  ## Verification Services — Password Reset by Email
  
  Password Reset by Email enables a user to securely reset their password using a secret code sent to their registered email address.
  
  All verification services, including password reset by email, are located under the `/verification-services` base path.
  
  ### When is Password Reset by Email Triggered?
  
  - When a user requests to reset their password by providing their email address.
  - This service is typically exposed on a “Forgot Password?” flow in the frontend.
  
  ### Password Reset Flow
  
  1. **Frontend calls `/verification-services/password-reset-by-email/start`** with the user's email.
     - Mindbricks checks if the user exists and if the email is registered.
     - A secret code is generated and stored in the cache linked to the user.
     - The code is sent to the user's email, or returned in the response (in development environments only for testing).
  2. **User receives the code and enters it into the frontend along with the new password.**
  3. **Frontend calls `/verification-services/password-reset-by-email/complete`** with the `email`, the `secretCode`, and the new `password`.
     - Mindbricks checks that the code is valid, not expired, and matches.
     - If valid, the user’s password is reset, their `emailVerified` flag is set to `true`, and a success response is returned.
  
  ---
  
  ## API Endpoints
  
  ### POST `/verification-services/password-reset-by-email/start`
  
  **Purpose**:  
  Starts the password reset process by generating and sending a secret verification code.
  
  #### Request Body
  
  | Parameter | Type   | Required | Description                         |
  |-----------|--------|----------|-------------------------------------|
  | email     | String | Yes      | The email address of the user       |
  
  ```json
  {
    "email": "user@example.com"
  }
  ```
  
  **Success Response**
  
  Returns secret code details (only in development environment) and confirmation that the verification step has been started.
  
  ```json
  {
    "userId": "user-uuid",
    "email": "user@example.com",
    "secretCode": "123456", 
    "expireTime": 86400,
    "date": "2024-04-29T10:00:00.000Z"
  }
  ```
  
  ⚠️ In production, the secret code is only sent via email and not exposed in the API response.
  
  **Error Responses**
  
  - `401 NotAuthenticated`: Email address not found or not associated with a user.
  - `403 Forbidden`: Sending a code too frequently (spam prevention).
  
  ---
  
  ### POST `/verification-services/password-reset-by-email/complete`
  
  **Purpose**:  
  Completes the password reset process by validating the secret code and updating the user's password.
  
  #### Request Body
  
  | Parameter   | Type   | Required | Description                                  |
  |-------------|--------|----------|----------------------------------------------|
  | email       | String | Yes      | The email address of the user                |
  | secretCode  | String | Yes      | The code received via email                  |
  | password    | String | Yes      | The new password the user wants to set       |
  
  ```json
  {
    "email": "user@example.com",
    "secretCode": "123456",
    "password": "newSecurePassword123"
  }
  ```
  
  **Success Response**
  
  ```json
  {
    "userId": "user-uuid",
    "email": "user@example.com",
    "isVerified": true
  }
  ```
  
  **Error Responses**
  
  - `403 Forbidden`:  
    - Secret code mismatch  
    - Secret code expired  
    - No ongoing verification found  
  
  ---
  
  ## Important Behavioral Notes
  
  ### Resend Throttling:
  A new verification code can only be requested after a cooldown period (configured via `resendTimeWindow`, e.g., 60 seconds).
  
  ### Expiration Handling:
  Verification codes automatically expire after a predefined period (`expireTimeWindow`, e.g., 1 day).
  
  ### Session & Event Handling:
  Mindbricks manages:
  - Spam prevention
  - Code caching per user
  - Expiration logic
  - Verification start/complete events
  
  ## Verification Services — Password Reset by Mobile
  
  Password reset by mobile provides users with a secure mechanism to reset their password using a verification code sent via SMS to their registered mobile number.
  
  All verification services, including password reset by mobile, are located under the `/verification-services` base path.
  
  ### When is Password Reset by Mobile Triggered?
  
  - When a user forgets their password and selects the mobile reset option.
  - When a user explicitly initiates password recovery via mobile on the login or help screen.
  
  ### Password Reset by Mobile Flow
  
  1. **Frontend calls `/verification-services/password-reset-by-mobile/start`** with the user's mobile number or associated identifier.
     - Mindbricks checks if a user with the given mobile exists.
     - A secret code is generated and stored in the cache for that user.
     - The code is sent to the user's mobile (or returned in development environments for testing).
  2. **User receives the code via SMS and enters it into the frontend app.**
  3. **Frontend calls `/verification-services/password-reset-by-mobile/complete`** with the user's `mobile`, the `secretCode`, and the new `password`.
     - Mindbricks validates the secret code and its expiration.
     - If valid, it updates the user's password and returns a success response.
  
  ---
  
  ## API Endpoints
  
  ### POST `/verification-services/password-reset-by-mobile/start`
  
  **Purpose**:  
  Initiates the mobile-based password reset by sending a verification code to the user's mobile.
  
  #### Request Body
  
  | Parameter | Type   | Required | Description                  |
  |-----------|--------|----------|------------------------------|
  | mobile    | String | Yes      | The mobile number to verify  |
  
  ```json
  {
    "mobile": "+905551234567"
  }
  ```
  
  ### Success Response
  
  Returns the verification context (code returned only in development):
  
  ```json
  {
    "userId": "user-uuid",
    "mobile": "+905551234567",
    "secretCode": "123456", 
    "expireTime": 86400,
    "date": "2024-04-29T10:00:00.000Z"
  }
  ```
  
  ⚠️ In production, the `secretCode` is not included in the response and is only sent via SMS.
  
  ### Error Responses
  
  - **400 Bad Request**: Mobile already verified
  - **403 Forbidden**: Rate-limited (code already sent recently)
  - **404 Not Found**: User with provided mobile not found
  
  ---
  
  ### POST `/verification-services/password-reset-by-mobile/complete`
  
  **Purpose**:  
  Finalizes the password reset process by validating the received verification code and updating the user’s password.
  
  #### Request Body
  
  | Parameter   | Type   | Required | Description                                     |
  |-------------|--------|----------|-------------------------------------------------|
  | mobile      | String | Yes      | The mobile number of the user                   |
  | secretCode  | String | Yes      | The code received via SMS                       |
  | password    | String | Yes      | The new password to assign                      |
  
  ```json
  {
    "mobile": "+905551234567",
    "secretCode": "123456",
    "password": "NewSecurePassword123!"
  }
  ```
  
  ### Success Response
  
  ```json
  {
    "userId": "user-uuid",
    "mobile": "+905551234567",
    "isVerified": true
  }
  ```
  
  ---
  
  ### Important Behavioral Notes
  
  - **Throttling**: Codes can only be resent after a delay defined by `resendTimeWindow` (e.g., 60 seconds).
  - **Expiration**: Codes expire after the `expireTimeWindow` (e.g., 1 day).
  - **One Active Session**: Only one active password reset session is allowed per user at a time.
  - **Session-less**: This flow does not require an active session — it works for unauthenticated users.
  
  💡 Mindbricks handles spam protection, session caching, and event-based logging (for both start and complete operations) as part of the verification service base class.
  
  
  ## Verification Method Types
  
  ### 🧾 For byCode Verifications
  
  This verification type requires the user to manually enter a 6-digit code.
  
  **Frontend Action**:  
  Display a secure input page where the user can enter the code they received via email or SMS. After collecting the code and any required metadata (such as `userId` or `sessionId`), make a `POST` request to the corresponding `/complete` endpoint.
  
  ---
  
  ### 🔗 For byLink Verifications
  
  This verification type uses a clickable link embedded in an email (or SMS message).
  
  **Frontend Action**:  
  The link points to a `GET` page in your frontend that parses `userId` and `code` from the query string and sends them to the backend via a `POST` request to the corresponding `/complete` endpoint. This enables one-click verification without requiring the user to type in a code.
  


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
