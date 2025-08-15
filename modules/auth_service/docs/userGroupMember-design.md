# Service Design Specification - Object Design for userGroupMember

**salesai-auth-service** documentation

## Document Overview

This document outlines the object design for the `userGroupMember` model in our application. It includes details about the model's attributes, relationships, and any specific validation or business logic that applies.

## userGroupMember Data Object

### Object Overview

**Description:** A data object that stores the members of the user group.

This object represents a core data structure within the service and acts as the blueprint for database interaction, API generation, and business logic enforcement.
It is defined using the `ObjectSettings` pattern, which governs its behavior, access control, caching strategy, and integration points with other systems such as Stripe and Redis.

### Core Configuration

- **Soft Delete:** Enabled — Determines whether records are marked inactive (`isActive = false`) instead of being physically deleted.
- **Public Access:** Yes — If enabled, anonymous users may access this object’s data depending on route-level rules.
- **Tenant-Level Scope:** No — Enables data isolation per tenant by attaching a tenant ID field.

### Redis Entity Caching

This data object is configured for Redis entity caching, which improves data retrieval performance by storing frequently accessed data in Redis.
Each time a new instance is created, updated or deleted, the cache is updated accordingly. Any get requests by id will first check the cache before querying the database.
If you want to use the cache by other select criteria, you can configure any data property as a Redis cluster.

### Composite Indexes

- **uniqueUserInGroup**: [userId, groupId]
  This composite index is defined to optimize query performance for complex queries involving multiple fields.

The index also defines a conflict resolution strategy for duplicate key violations.

When a new record would violate this composite index, the following action will be taken:

**On Duplicate**: `doUpdate`

The existing record will be updated with the new data.No error will be thrown.

### Properties Schema

| Property  | Type | Required | Description                                                                    |
| --------- | ---- | -------- | ------------------------------------------------------------------------------ |
| `groupId` | ID   | Yes      | An ID value to represent the group that the user is asssigned as a memeber to. |
| `userId`  | ID   | Yes      | An ID value to represent the user that is assgined as a member to the group.   |
| `ownerId` | ID   | Yes      | An ID value to represent the admin user who assgined the member.               |

- Required properties are mandatory for creating objects and must be provided in the request body if no default value is set.

### Constant Properties

`groupId` `userId` `ownerId`

Constant properties are defined to be immutable after creation, meaning they cannot be updated or changed once set. They are typically used for properties that should remain constant throughout the object's lifecycle.
A property is set to be constant if the `Allow Update` option is set to `false`.

### Elastic Search Indexing

`groupId` `userId` `ownerId`

Properties that are indexed in Elastic Search will be searchable via the Elastic Search API.
While all properties are stored in the elastic search index of the data object, only those marked for Elastic Search indexing will be available for search queries.

### Database Indexing

`groupId` `userId` `ownerId`

Properties that are indexed in the database will be optimized for query performance, allowing for faster data retrieval.
Make a property indexed in the database if you want to use it frequently in query filters or sorting.

### Cache Select Properties

`groupId` `userId` `ownerId`

Cache select properties are used to collect data from Redis entity cache with a different key than the data object id.
This allows you to cache data that is not directly related to the data object id, but a frequently used filter.

### Relation Properties

`groupId` `userId` `ownerId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
You can define relations in the data object properties, which will be used to create foreign key constraints in the database.
For complex joins operations, Mindbricks supportsa BFF pattern, where you can view dynamic and static views based on Elastic Search Indexes.
Use db level relations for simple one-to-one or one-to-many relationships, and use BFF views for complex joins that require multiple data objects to be joined together.

- **groupId**: ID
  Relation to `userGroup`.id

The target object is a parent object, meaning that the relation is a one-to-many relationship from target to this object.

On Delete: Set Null
Required: No

- **userId**: ID
  Relation to `user`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

On Delete: Set Null
Required: No

- **ownerId**: ID
  Relation to `user`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

On Delete: Set Null
Required: No

### Session Data Properties

`ownerId`

Session data properties are used to store data that is specific to the user session, allowing for personalized experiences and temporary data storage.
If a property is configured as session data, it will be automatically mapped to the related field in the user session during CRUD operations.
Note that session data properties can not be mutated by the user, but only by the system.

- **ownerId**: ID property will be mapped to the session parameter `userId`.

### Filter Properties

`groupId` `userId` `ownerId`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as route parameters in the listing CRUD routes that have "Auto Params" enabled.

- **groupId**: ID has a filter named `groupId`

- **userId**: ID has a filter named `userId`

- **ownerId**: ID has a filter named `ownerId`
