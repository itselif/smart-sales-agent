# EVENT GUIDE
## salesai-auth-service

Authentication service for the project

## Architectural Design Credit and Contact Information

The architectural design of this microservice is credited to . For inquiries, feedback, or further information regarding the architecture, please direct your communication to:

Email: 

We encourage open communication and welcome any questions or discussions related to the architectural aspects of this microservice.

# Documentation Scope

Welcome to the official documentation for the `Auth` Service Event descriptions. This guide is dedicated to detailing how to subscribe to and listen for state changes within the `Auth` Service, offering an exclusive focus on event subscription mechanisms.

**Intended Audience**

This documentation is aimed at developers and integrators looking to monitor `Auth` Service state changes. It is especially relevant for those wishing to implement or enhance business logic based on interactions with `Auth` objects.

**Overview**

This section provides detailed instructions on monitoring service events, covering payload structures and demonstrating typical use cases through examples.

# Authentication and Authorization

Access to the `Auth` service's events is facilitated through the project's Kafka server, which is not accessible to the public. Subscription to a Kafka topic requires being on the same network and possessing valid Kafka user credentials.  This document presupposes that readers have existing access to the Kafka server.

Additionally, the service offers a public subscription option via REST for real-time data management in frontend applications, secured through REST API authentication and authorization mechanisms. To subscribe to service events via the REST API, please consult the Realtime REST API Guide.

# Database Events

Database events are triggered at the database layer, automatically and atomically, in response to any modifications at the data level. These events serve to notify subscribers about the creation, update, or deletion of objects within the database, distinct from any overarching business logic. 

Listening to database events is particularly beneficial for those focused on tracking changes at the database level. A typical use case for subscribing to database events is to replicate the data store of one service within another service's scope, ensuring data consistency and syncronization across services.

For example, while a business operation such as "approve membership" might generate a high-level business event like `membership-approved`, the underlying database changes could involve multiple state updates to different entities. These might be published as separate events, such as `dbevent-member-updated` and `dbevent-user-updated`, reflecting the granular changes at the database level.

Such detailed eventing provides a robust foundation for building responsive, data-driven applications, enabling fine-grained observability and reaction to the dynamics of the data landscape. It also facilitates the architectural pattern of event sourcing, where state changes are captured as a sequence of events, allowing for high-fidelity data replication and history replay for analytical or auditing purposes.

## DbEvent user-created

**Event topic**: `salesai1-auth-service-dbevent-user-created`

This event is triggered upon the creation of a `user` data object in the database. The event payload encompasses the newly created data, encapsulated within the root of the paylod.

**Event payload**: 
```json
{"id":"ID","_owner":"ID","email":"String","password":"String","fullname":"String","avatar":"String","emailVerified":"Boolean","storeId":"ID","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"}
```  
## DbEvent user-updated

**Event topic**: `salesai1-auth-service-dbevent-user-updated`

Activation of this event follows the update of a `user` data object. The payload contains the updated information under the `user` attribute, along with the original data prior to update, labeled as `old_user`.

**Event payload**: 
```json
{
old_user:{"id":"ID","_owner":"ID","email":"String","password":"String","fullname":"String","avatar":"String","emailVerified":"Boolean","storeId":"ID","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"},
user:{"id":"ID","_owner":"ID","email":"String","password":"String","fullname":"String","avatar":"String","emailVerified":"Boolean","storeId":"ID","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"},
}
``` 
## DbEvent user-deleted

**Event topic**: `salesai1-auth-service-dbevent-user-deleted`

This event announces the deletion of a `user` data object, covering both hard deletions (permanent removal) and soft deletions (where the `isActive` attribute is set to false). Regardless of the deletion type, the event payload will present the data as it was immediately before deletion, highlighting an `isActive` status of false for soft deletions.

**Event payload**: 
```json
{"id":"ID","_owner":"ID","email":"String","password":"String","fullname":"String","avatar":"String","emailVerified":"Boolean","storeId":"ID","isActive":false,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"}
```  
## DbEvent userGroup-created

**Event topic**: `salesai1-auth-service-dbevent-usergroup-created`

This event is triggered upon the creation of a `userGroup` data object in the database. The event payload encompasses the newly created data, encapsulated within the root of the paylod.

**Event payload**: 
```json
{"id":"ID","_owner":"ID","groupName":"String","avatar":"String","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"}
```  
## DbEvent userGroup-updated

**Event topic**: `salesai1-auth-service-dbevent-usergroup-updated`

Activation of this event follows the update of a `userGroup` data object. The payload contains the updated information under the `userGroup` attribute, along with the original data prior to update, labeled as `old_userGroup`.

**Event payload**: 
```json
{
old_userGroup:{"id":"ID","_owner":"ID","groupName":"String","avatar":"String","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"},
userGroup:{"id":"ID","_owner":"ID","groupName":"String","avatar":"String","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"},
}
``` 
## DbEvent userGroup-deleted

**Event topic**: `salesai1-auth-service-dbevent-usergroup-deleted`

This event announces the deletion of a `userGroup` data object, covering both hard deletions (permanent removal) and soft deletions (where the `isActive` attribute is set to false). Regardless of the deletion type, the event payload will present the data as it was immediately before deletion, highlighting an `isActive` status of false for soft deletions.

**Event payload**: 
```json
{"id":"ID","_owner":"ID","groupName":"String","avatar":"String","isActive":false,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"}
```  
## DbEvent userGroupMember-created

**Event topic**: `salesai1-auth-service-dbevent-usergroupmember-created`

This event is triggered upon the creation of a `userGroupMember` data object in the database. The event payload encompasses the newly created data, encapsulated within the root of the paylod.

**Event payload**: 
```json
{"id":"ID","_owner":"ID","groupId":"ID","userId":"ID","ownerId":"ID","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"}
```  
## DbEvent userGroupMember-updated

**Event topic**: `salesai1-auth-service-dbevent-usergroupmember-updated`

Activation of this event follows the update of a `userGroupMember` data object. The payload contains the updated information under the `userGroupMember` attribute, along with the original data prior to update, labeled as `old_userGroupMember`.

**Event payload**: 
```json
{
old_userGroupMember:{"id":"ID","_owner":"ID","groupId":"ID","userId":"ID","ownerId":"ID","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"},
userGroupMember:{"id":"ID","_owner":"ID","groupId":"ID","userId":"ID","ownerId":"ID","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"},
}
``` 
## DbEvent userGroupMember-deleted

**Event topic**: `salesai1-auth-service-dbevent-usergroupmember-deleted`

This event announces the deletion of a `userGroupMember` data object, covering both hard deletions (permanent removal) and soft deletions (where the `isActive` attribute is set to false). Regardless of the deletion type, the event payload will present the data as it was immediately before deletion, highlighting an `isActive` status of false for soft deletions.

**Event payload**: 
```json
{"id":"ID","_owner":"ID","groupId":"ID","userId":"ID","ownerId":"ID","isActive":false,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"}
```  
## DbEvent store-created

**Event topic**: `salesai1-auth-service-dbevent-store-created`

This event is triggered upon the creation of a `store` data object in the database. The event payload encompasses the newly created data, encapsulated within the root of the paylod.

**Event payload**: 
```json
{"id":"ID","_owner":"ID","name":"String","codename":"String","fullname":"String","avatar":"String","ownerId":"ID","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"}
```  
## DbEvent store-updated

**Event topic**: `salesai1-auth-service-dbevent-store-updated`

Activation of this event follows the update of a `store` data object. The payload contains the updated information under the `store` attribute, along with the original data prior to update, labeled as `old_store`.

**Event payload**: 
```json
{
old_store:{"id":"ID","_owner":"ID","name":"String","codename":"String","fullname":"String","avatar":"String","ownerId":"ID","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"},
store:{"id":"ID","_owner":"ID","name":"String","codename":"String","fullname":"String","avatar":"String","ownerId":"ID","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"},
}
``` 
## DbEvent store-deleted

**Event topic**: `salesai1-auth-service-dbevent-store-deleted`

This event announces the deletion of a `store` data object, covering both hard deletions (permanent removal) and soft deletions (where the `isActive` attribute is set to false). Regardless of the deletion type, the event payload will present the data as it was immediately before deletion, highlighting an `isActive` status of false for soft deletions.

**Event payload**: 
```json
{"id":"ID","_owner":"ID","name":"String","codename":"String","fullname":"String","avatar":"String","ownerId":"ID","isActive":false,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"}
```  


# ElasticSearch Index Events

Within the `Auth` service, most data objects are mirrored in ElasticSearch indices, ensuring these indices remain syncronized with their database counterparts through creation, updates, and deletions. These indices serve dual purposes: they act as a data source for external services and furnish aggregated data tailored to enhance frontend user experiences. Consequently, an ElasticSearch index might encapsulate data in its original form or aggregate additional information from other data objects. 

These aggregations can include both one-to-one and one-to-many relationships not only with database objects within the same service but also across different services. This capability allows developers to access comprehensive, aggregated data efficiently. By subscribing to ElasticSearch index events, developers are notified when an index is updated and can directly obtain the aggregated entity within the event payload, bypassing the need for separate ElasticSearch queries.

It's noteworthy that some services may augment another service's index by appending to the entity’s `extends` object. In such scenarios, an `*-extended` event will contain only the newly added data. Should you require the complete dataset, you would need to retrieve the full ElasticSearch index entity using the provided ID.

This approach to indexing and event handling facilitates a modular, interconnected architecture where services can seamlessly integrate and react to changes, enriching the overall data ecosystem and enabling more dynamic, responsive applications.



## Index Event user-created

**Event topic**: `elastic-index-salesai_user-created`

**Event payload**:
```json
{"id":"ID","_owner":"ID","email":"String","password":"String","fullname":"String","avatar":"String","emailVerified":"Boolean","storeId":"ID","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"}
```  

## Index Event user-updated

**Event topic**: `elastic-index-salesai_user-created`

**Event payload**:
```json
{"id":"ID","_owner":"ID","email":"String","password":"String","fullname":"String","avatar":"String","emailVerified":"Boolean","storeId":"ID","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"}
```  

## Index Event user-deleted

**Event topic**: `elastic-index-salesai_user-deleted`

**Event payload**:
```json
{"id":"ID","_owner":"ID","email":"String","password":"String","fullname":"String","avatar":"String","emailVerified":"Boolean","storeId":"ID","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"}
```  

## Index Event user-extended

**Event topic**: `elastic-index-salesai_user-extended`

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

## Route Event user-created

**Event topic** : `salesai1-auth-service-user-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"create","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event user-updated

**Event topic** : `salesai1-auth-service-user-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"update","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event user-deleted

**Event topic** : `salesai1-auth-service-user-deleted`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"delete","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":false}}
```  
## Route Event userrole-updated

**Event topic** : `salesai1-auth-service-userrole-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"update","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event password-updated

**Event topic** : `salesai1-auth-service-password-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"update","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event tenantuser-registerred

**Event topic** : `salesai1-auth-service-tenantuser-registerred`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"create","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event storeowner-registerred

**Event topic** : `salesai1-auth-service-storeowner-registerred`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"create","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event user-retrived

**Event topic** : `salesai1-auth-service-user-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"get","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event users-listed

**Event topic** : `salesai1-auth-service-users-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `users` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`users`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"users","action":"getList","appVersion":"Version","rowCount":"\"Number\"","users":[{"id":"ID","isActive":true},{},{}],"paging":{"pageNumber":"Number","pageRowCount":"NUmber","totalRowCount":"Number","pageCount":"Number"},"filters":[],"uiPermissions":[]}
```  
## Route Event group-created

**Event topic** : `salesai1-auth-service-group-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroup` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroup`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroup","action":"create","appVersion":"Version","rowCount":1,"userGroup":{"id":"ID","isActive":true}}
```  
## Route Event group-updated

**Event topic** : `salesai1-auth-service-group-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroup` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroup`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroup","action":"update","appVersion":"Version","rowCount":1,"userGroup":{"id":"ID","isActive":true}}
```  
## Route Event group-retrived

**Event topic** : `salesai1-auth-service-group-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroup` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroup`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroup","action":"get","appVersion":"Version","rowCount":1,"userGroup":{"id":"ID","isActive":true}}
```  
## Route Event groups-listed

**Event topic** : `salesai1-auth-service-groups-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroups` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroups`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroups","action":"getList","appVersion":"Version","rowCount":"\"Number\"","userGroups":[{"id":"ID","isActive":true},{},{}],"paging":{"pageNumber":"Number","pageRowCount":"NUmber","totalRowCount":"Number","pageCount":"Number"},"filters":[],"uiPermissions":[]}
```  
## Route Event groupmember-created

**Event topic** : `salesai1-auth-service-groupmember-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroupMember` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroupMember`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroupMember","action":"create","appVersion":"Version","rowCount":1,"userGroupMember":{"id":"ID","isActive":true}}
```  
## Route Event groupmember-deleted

**Event topic** : `salesai1-auth-service-groupmember-deleted`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroupMember` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroupMember`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroupMember","action":"delete","appVersion":"Version","rowCount":1,"userGroupMember":{"id":"ID","isActive":false}}
```  
## Route Event groupmember-retrived

**Event topic** : `salesai1-auth-service-groupmember-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroupMember` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroupMember`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroupMember","action":"get","appVersion":"Version","rowCount":1,"userGroupMember":{"id":"ID","isActive":true}}
```  
## Route Event groupmembers-listed

**Event topic** : `salesai1-auth-service-groupmembers-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroupMembers` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroupMembers`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroupMembers","action":"getList","appVersion":"Version","rowCount":"\"Number\"","userGroupMembers":[{"id":"ID","isActive":true},{},{}],"paging":{"pageNumber":"Number","pageRowCount":"NUmber","totalRowCount":"Number","pageCount":"Number"},"filters":[],"uiPermissions":[]}
```  
## Route Event store-created

**Event topic** : `salesai1-auth-service-store-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `store` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`store`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"store","action":"create","appVersion":"Version","rowCount":1,"store":{"id":"ID","isActive":true}}
```  
## Route Event store-retrived

**Event topic** : `salesai1-auth-service-store-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `store` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`store`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"store","action":"get","appVersion":"Version","rowCount":1,"store":{"id":"ID","isActive":true}}
```  
## Route Event storebycodename-retrived

**Event topic** : `salesai1-auth-service-storebycodename-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `store` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`store`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"store","action":"get","appVersion":"Version","rowCount":1,"store":{"id":"ID","isActive":true}}
```  
## Route Event registeredstores-listed

**Event topic** : `salesai1-auth-service-registeredstores-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `stores` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`stores`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"stores","action":"getList","appVersion":"Version","rowCount":"\"Number\"","stores":[{"id":"ID","isActive":true},{},{}],"paging":{"pageNumber":"Number","pageRowCount":"NUmber","totalRowCount":"Number","pageCount":"Number"},"filters":[],"uiPermissions":[]}
```  



## Index Event usergroup-created

**Event topic**: `elastic-index-salesai_usergroup-created`

**Event payload**:
```json
{"id":"ID","_owner":"ID","groupName":"String","avatar":"String","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"}
```  

## Index Event usergroup-updated

**Event topic**: `elastic-index-salesai_usergroup-created`

**Event payload**:
```json
{"id":"ID","_owner":"ID","groupName":"String","avatar":"String","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"}
```  

## Index Event usergroup-deleted

**Event topic**: `elastic-index-salesai_usergroup-deleted`

**Event payload**:
```json
{"id":"ID","_owner":"ID","groupName":"String","avatar":"String","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"}
```  

## Index Event usergroup-extended

**Event topic**: `elastic-index-salesai_usergroup-extended`

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

## Route Event user-created

**Event topic** : `salesai1-auth-service-user-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"create","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event user-updated

**Event topic** : `salesai1-auth-service-user-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"update","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event user-deleted

**Event topic** : `salesai1-auth-service-user-deleted`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"delete","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":false}}
```  
## Route Event userrole-updated

**Event topic** : `salesai1-auth-service-userrole-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"update","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event password-updated

**Event topic** : `salesai1-auth-service-password-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"update","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event tenantuser-registerred

**Event topic** : `salesai1-auth-service-tenantuser-registerred`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"create","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event storeowner-registerred

**Event topic** : `salesai1-auth-service-storeowner-registerred`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"create","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event user-retrived

**Event topic** : `salesai1-auth-service-user-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"get","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event users-listed

**Event topic** : `salesai1-auth-service-users-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `users` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`users`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"users","action":"getList","appVersion":"Version","rowCount":"\"Number\"","users":[{"id":"ID","isActive":true},{},{}],"paging":{"pageNumber":"Number","pageRowCount":"NUmber","totalRowCount":"Number","pageCount":"Number"},"filters":[],"uiPermissions":[]}
```  
## Route Event group-created

**Event topic** : `salesai1-auth-service-group-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroup` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroup`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroup","action":"create","appVersion":"Version","rowCount":1,"userGroup":{"id":"ID","isActive":true}}
```  
## Route Event group-updated

**Event topic** : `salesai1-auth-service-group-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroup` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroup`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroup","action":"update","appVersion":"Version","rowCount":1,"userGroup":{"id":"ID","isActive":true}}
```  
## Route Event group-retrived

**Event topic** : `salesai1-auth-service-group-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroup` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroup`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroup","action":"get","appVersion":"Version","rowCount":1,"userGroup":{"id":"ID","isActive":true}}
```  
## Route Event groups-listed

**Event topic** : `salesai1-auth-service-groups-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroups` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroups`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroups","action":"getList","appVersion":"Version","rowCount":"\"Number\"","userGroups":[{"id":"ID","isActive":true},{},{}],"paging":{"pageNumber":"Number","pageRowCount":"NUmber","totalRowCount":"Number","pageCount":"Number"},"filters":[],"uiPermissions":[]}
```  
## Route Event groupmember-created

**Event topic** : `salesai1-auth-service-groupmember-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroupMember` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroupMember`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroupMember","action":"create","appVersion":"Version","rowCount":1,"userGroupMember":{"id":"ID","isActive":true}}
```  
## Route Event groupmember-deleted

**Event topic** : `salesai1-auth-service-groupmember-deleted`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroupMember` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroupMember`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroupMember","action":"delete","appVersion":"Version","rowCount":1,"userGroupMember":{"id":"ID","isActive":false}}
```  
## Route Event groupmember-retrived

**Event topic** : `salesai1-auth-service-groupmember-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroupMember` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroupMember`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroupMember","action":"get","appVersion":"Version","rowCount":1,"userGroupMember":{"id":"ID","isActive":true}}
```  
## Route Event groupmembers-listed

**Event topic** : `salesai1-auth-service-groupmembers-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroupMembers` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroupMembers`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroupMembers","action":"getList","appVersion":"Version","rowCount":"\"Number\"","userGroupMembers":[{"id":"ID","isActive":true},{},{}],"paging":{"pageNumber":"Number","pageRowCount":"NUmber","totalRowCount":"Number","pageCount":"Number"},"filters":[],"uiPermissions":[]}
```  
## Route Event store-created

**Event topic** : `salesai1-auth-service-store-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `store` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`store`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"store","action":"create","appVersion":"Version","rowCount":1,"store":{"id":"ID","isActive":true}}
```  
## Route Event store-retrived

**Event topic** : `salesai1-auth-service-store-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `store` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`store`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"store","action":"get","appVersion":"Version","rowCount":1,"store":{"id":"ID","isActive":true}}
```  
## Route Event storebycodename-retrived

**Event topic** : `salesai1-auth-service-storebycodename-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `store` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`store`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"store","action":"get","appVersion":"Version","rowCount":1,"store":{"id":"ID","isActive":true}}
```  
## Route Event registeredstores-listed

**Event topic** : `salesai1-auth-service-registeredstores-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `stores` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`stores`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"stores","action":"getList","appVersion":"Version","rowCount":"\"Number\"","stores":[{"id":"ID","isActive":true},{},{}],"paging":{"pageNumber":"Number","pageRowCount":"NUmber","totalRowCount":"Number","pageCount":"Number"},"filters":[],"uiPermissions":[]}
```  



## Index Event usergroupmember-created

**Event topic**: `elastic-index-salesai_usergroupmember-created`

**Event payload**:
```json
{"id":"ID","_owner":"ID","groupId":"ID","userId":"ID","ownerId":"ID","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"}
```  

## Index Event usergroupmember-updated

**Event topic**: `elastic-index-salesai_usergroupmember-created`

**Event payload**:
```json
{"id":"ID","_owner":"ID","groupId":"ID","userId":"ID","ownerId":"ID","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"}
```  

## Index Event usergroupmember-deleted

**Event topic**: `elastic-index-salesai_usergroupmember-deleted`

**Event payload**:
```json
{"id":"ID","_owner":"ID","groupId":"ID","userId":"ID","ownerId":"ID","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"}
```  

## Index Event usergroupmember-extended

**Event topic**: `elastic-index-salesai_usergroupmember-extended`

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

## Route Event user-created

**Event topic** : `salesai1-auth-service-user-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"create","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event user-updated

**Event topic** : `salesai1-auth-service-user-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"update","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event user-deleted

**Event topic** : `salesai1-auth-service-user-deleted`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"delete","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":false}}
```  
## Route Event userrole-updated

**Event topic** : `salesai1-auth-service-userrole-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"update","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event password-updated

**Event topic** : `salesai1-auth-service-password-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"update","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event tenantuser-registerred

**Event topic** : `salesai1-auth-service-tenantuser-registerred`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"create","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event storeowner-registerred

**Event topic** : `salesai1-auth-service-storeowner-registerred`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"create","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event user-retrived

**Event topic** : `salesai1-auth-service-user-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"get","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event users-listed

**Event topic** : `salesai1-auth-service-users-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `users` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`users`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"users","action":"getList","appVersion":"Version","rowCount":"\"Number\"","users":[{"id":"ID","isActive":true},{},{}],"paging":{"pageNumber":"Number","pageRowCount":"NUmber","totalRowCount":"Number","pageCount":"Number"},"filters":[],"uiPermissions":[]}
```  
## Route Event group-created

**Event topic** : `salesai1-auth-service-group-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroup` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroup`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroup","action":"create","appVersion":"Version","rowCount":1,"userGroup":{"id":"ID","isActive":true}}
```  
## Route Event group-updated

**Event topic** : `salesai1-auth-service-group-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroup` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroup`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroup","action":"update","appVersion":"Version","rowCount":1,"userGroup":{"id":"ID","isActive":true}}
```  
## Route Event group-retrived

**Event topic** : `salesai1-auth-service-group-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroup` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroup`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroup","action":"get","appVersion":"Version","rowCount":1,"userGroup":{"id":"ID","isActive":true}}
```  
## Route Event groups-listed

**Event topic** : `salesai1-auth-service-groups-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroups` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroups`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroups","action":"getList","appVersion":"Version","rowCount":"\"Number\"","userGroups":[{"id":"ID","isActive":true},{},{}],"paging":{"pageNumber":"Number","pageRowCount":"NUmber","totalRowCount":"Number","pageCount":"Number"},"filters":[],"uiPermissions":[]}
```  
## Route Event groupmember-created

**Event topic** : `salesai1-auth-service-groupmember-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroupMember` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroupMember`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroupMember","action":"create","appVersion":"Version","rowCount":1,"userGroupMember":{"id":"ID","isActive":true}}
```  
## Route Event groupmember-deleted

**Event topic** : `salesai1-auth-service-groupmember-deleted`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroupMember` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroupMember`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroupMember","action":"delete","appVersion":"Version","rowCount":1,"userGroupMember":{"id":"ID","isActive":false}}
```  
## Route Event groupmember-retrived

**Event topic** : `salesai1-auth-service-groupmember-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroupMember` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroupMember`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroupMember","action":"get","appVersion":"Version","rowCount":1,"userGroupMember":{"id":"ID","isActive":true}}
```  
## Route Event groupmembers-listed

**Event topic** : `salesai1-auth-service-groupmembers-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroupMembers` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroupMembers`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroupMembers","action":"getList","appVersion":"Version","rowCount":"\"Number\"","userGroupMembers":[{"id":"ID","isActive":true},{},{}],"paging":{"pageNumber":"Number","pageRowCount":"NUmber","totalRowCount":"Number","pageCount":"Number"},"filters":[],"uiPermissions":[]}
```  
## Route Event store-created

**Event topic** : `salesai1-auth-service-store-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `store` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`store`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"store","action":"create","appVersion":"Version","rowCount":1,"store":{"id":"ID","isActive":true}}
```  
## Route Event store-retrived

**Event topic** : `salesai1-auth-service-store-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `store` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`store`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"store","action":"get","appVersion":"Version","rowCount":1,"store":{"id":"ID","isActive":true}}
```  
## Route Event storebycodename-retrived

**Event topic** : `salesai1-auth-service-storebycodename-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `store` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`store`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"store","action":"get","appVersion":"Version","rowCount":1,"store":{"id":"ID","isActive":true}}
```  
## Route Event registeredstores-listed

**Event topic** : `salesai1-auth-service-registeredstores-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `stores` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`stores`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"stores","action":"getList","appVersion":"Version","rowCount":"\"Number\"","stores":[{"id":"ID","isActive":true},{},{}],"paging":{"pageNumber":"Number","pageRowCount":"NUmber","totalRowCount":"Number","pageCount":"Number"},"filters":[],"uiPermissions":[]}
```  



## Index Event store-created

**Event topic**: `elastic-index-salesai_store-created`

**Event payload**:
```json
{"id":"ID","_owner":"ID","name":"String","codename":"String","fullname":"String","avatar":"String","ownerId":"ID","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"}
```  

## Index Event store-updated

**Event topic**: `elastic-index-salesai_store-created`

**Event payload**:
```json
{"id":"ID","_owner":"ID","name":"String","codename":"String","fullname":"String","avatar":"String","ownerId":"ID","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"}
```  

## Index Event store-deleted

**Event topic**: `elastic-index-salesai_store-deleted`

**Event payload**:
```json
{"id":"ID","_owner":"ID","name":"String","codename":"String","fullname":"String","avatar":"String","ownerId":"ID","isActive":true,"recordVersion":"Integer","createdAt":"Date","updatedAt":"Date"}
```  

## Index Event store-extended

**Event topic**: `elastic-index-salesai_store-extended`

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

## Route Event user-created

**Event topic** : `salesai1-auth-service-user-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"create","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event user-updated

**Event topic** : `salesai1-auth-service-user-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"update","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event user-deleted

**Event topic** : `salesai1-auth-service-user-deleted`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"delete","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":false}}
```  
## Route Event userrole-updated

**Event topic** : `salesai1-auth-service-userrole-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"update","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event password-updated

**Event topic** : `salesai1-auth-service-password-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"update","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event tenantuser-registerred

**Event topic** : `salesai1-auth-service-tenantuser-registerred`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"create","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event storeowner-registerred

**Event topic** : `salesai1-auth-service-storeowner-registerred`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"create","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event user-retrived

**Event topic** : `salesai1-auth-service-user-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `user` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`user`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"user","action":"get","appVersion":"Version","rowCount":1,"user":{"id":"ID","isActive":true}}
```  
## Route Event users-listed

**Event topic** : `salesai1-auth-service-users-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `users` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`users`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"users","action":"getList","appVersion":"Version","rowCount":"\"Number\"","users":[{"id":"ID","isActive":true},{},{}],"paging":{"pageNumber":"Number","pageRowCount":"NUmber","totalRowCount":"Number","pageCount":"Number"},"filters":[],"uiPermissions":[]}
```  
## Route Event group-created

**Event topic** : `salesai1-auth-service-group-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroup` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroup`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroup","action":"create","appVersion":"Version","rowCount":1,"userGroup":{"id":"ID","isActive":true}}
```  
## Route Event group-updated

**Event topic** : `salesai1-auth-service-group-updated`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroup` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroup`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroup","action":"update","appVersion":"Version","rowCount":1,"userGroup":{"id":"ID","isActive":true}}
```  
## Route Event group-retrived

**Event topic** : `salesai1-auth-service-group-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroup` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroup`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroup","action":"get","appVersion":"Version","rowCount":1,"userGroup":{"id":"ID","isActive":true}}
```  
## Route Event groups-listed

**Event topic** : `salesai1-auth-service-groups-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroups` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroups`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroups","action":"getList","appVersion":"Version","rowCount":"\"Number\"","userGroups":[{"id":"ID","isActive":true},{},{}],"paging":{"pageNumber":"Number","pageRowCount":"NUmber","totalRowCount":"Number","pageCount":"Number"},"filters":[],"uiPermissions":[]}
```  
## Route Event groupmember-created

**Event topic** : `salesai1-auth-service-groupmember-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroupMember` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroupMember`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroupMember","action":"create","appVersion":"Version","rowCount":1,"userGroupMember":{"id":"ID","isActive":true}}
```  
## Route Event groupmember-deleted

**Event topic** : `salesai1-auth-service-groupmember-deleted`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroupMember` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroupMember`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroupMember","action":"delete","appVersion":"Version","rowCount":1,"userGroupMember":{"id":"ID","isActive":false}}
```  
## Route Event groupmember-retrived

**Event topic** : `salesai1-auth-service-groupmember-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroupMember` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroupMember`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroupMember","action":"get","appVersion":"Version","rowCount":1,"userGroupMember":{"id":"ID","isActive":true}}
```  
## Route Event groupmembers-listed

**Event topic** : `salesai1-auth-service-groupmembers-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `userGroupMembers` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`userGroupMembers`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"userGroupMembers","action":"getList","appVersion":"Version","rowCount":"\"Number\"","userGroupMembers":[{"id":"ID","isActive":true},{},{}],"paging":{"pageNumber":"Number","pageRowCount":"NUmber","totalRowCount":"Number","pageCount":"Number"},"filters":[],"uiPermissions":[]}
```  
## Route Event store-created

**Event topic** : `salesai1-auth-service-store-created`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `store` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`store`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"store","action":"create","appVersion":"Version","rowCount":1,"store":{"id":"ID","isActive":true}}
```  
## Route Event store-retrived

**Event topic** : `salesai1-auth-service-store-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `store` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`store`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"store","action":"get","appVersion":"Version","rowCount":1,"store":{"id":"ID","isActive":true}}
```  
## Route Event storebycodename-retrived

**Event topic** : `salesai1-auth-service-storebycodename-retrived`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `store` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`store`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"store","action":"get","appVersion":"Version","rowCount":1,"store":{"id":"ID","isActive":true}}
```  
## Route Event registeredstores-listed

**Event topic** : `salesai1-auth-service-registeredstores-listed`

**Event payload**:

The event payload, mirroring the REST API response, is structured as an encapsulated JSON. It includes metadata related to the API as well as the `stores` data object itself. 

The following JSON included in the payload illustrates the fullest representation of the **`stores`** object. Note, however, that certain properties might be excluded in accordance with the object's inherent logic.

```json
{"status":"OK","statusCode":"200","elapsedMs":126,"ssoTime":120,"source":"db","cacheKey":"hexCode","userId":"ID","sessionId":"ID","requestId":"ID","dataName":"stores","action":"getList","appVersion":"Version","rowCount":"\"Number\"","stores":[{"id":"ID","isActive":true},{},{}],"paging":{"pageNumber":"Number","pageRowCount":"NUmber","totalRowCount":"Number","pageCount":"Number"},"filters":[],"uiPermissions":[]}
```  




# Copyright
All sources, documents and other digital materials are copyright of .

# About Us
For more information please visit our website: .

.
.
