# Service Design Specification - Object Design for storeAssignment

**salesai-storemanagement-service** documentation

## Document Overview

This document outlines the object design for the `storeAssignment` model in our application. It includes details about the model's attributes, relationships, and any specific validation or business logic that applies.

## storeAssignment Data Object

### Object Overview

**Description:** Represents the assignment of a user (seller, manager) to one or more stores. Supports override/temporary assignments, status, and assignment type fields for audit and dynamic access enforcement.

This object represents a core data structure within the service and acts as the blueprint for database interaction, API generation, and business logic enforcement.
It is defined using the `ObjectSettings` pattern, which governs its behavior, access control, caching strategy, and integration points with other systems such as Stripe and Redis.

### Core Configuration

- **Soft Delete:** Enabled — Determines whether records are marked inactive (`isActive = false`) instead of being physically deleted.
- **Public Access:** No — If enabled, anonymous users may access this object’s data depending on route-level rules.
- **Tenant-Level Scope:** No — Enables data isolation per tenant by attaching a tenant ID field.

### Composite Indexes

- **uniqueAssignment**: [userId, storeId, assignmentType]
  This composite index is defined to optimize query performance for complex queries involving multiple fields.

The index also defines a conflict resolution strategy for duplicate key violations.

When a new record would violate this composite index, the following action will be taken:

**On Duplicate**: `throwError`

An error will be thrown, preventing the insertion of conflicting data.

### Properties Schema

| Property                | Type | Required | Description                                                                                      |
| ----------------------- | ---- | -------- | ------------------------------------------------------------------------------------------------ |
| `userId`                | ID   | Yes      | ID of the assigned user (references auth.user).                                                  |
| `storeId`               | ID   | Yes      | ID of the store this assignment represents.                                                      |
| `role`                  | Enum | Yes      | User&#39;s functional role in this store assignment: 0=seller, 1=manager, 2=admin.               |
| `assignmentType`        | Enum | Yes      | Assignment type: 0=normal, 1=override (for temporary/exception access).                          |
| `status`                | Enum | Yes      | Assignment status: 0=active, 1=revoked, 2=pending.                                               |
| `overrideJustification` | Text | No       | If assignmentType is override, field storing justification for override (if required by policy). |
| `validFrom`             | Date | No       | The date/time this assignment/override becomes valid.                                            |
| `validUntil`            | Date | No       | If override, optional date/time until which assignment/override is valid (expiry).               |

- Required properties are mandatory for creating objects and must be provided in the request body if no default value is set.

### Constant Properties

`userId` `storeId` `role`

Constant properties are defined to be immutable after creation, meaning they cannot be updated or changed once set. They are typically used for properties that should remain constant throughout the object's lifecycle.
A property is set to be constant if the `Allow Update` option is set to `false`.

### Auto Update Properties

`assignmentType` `status` `overrideJustification` `validFrom` `validUntil`

An update crud route created with the option `Auto Params` enabled will automatically update these properties with the provided values in the request body.
If you want to update any property in your own business logic not by user input, you can set the `Allow Auto Update` option to false.
These properties will be added to the update route's body parameters and can be updated by the user if any value is provided in the request body.

### Enum Properties

Enum properties are defined with a set of allowed values, ensuring that only valid options can be assigned to them.
The enum options value will be stored as strings in the database,
but when a data object is created an addtional property with the same name plus an idx suffix will be created, which will hold the index of the selected enum option.
You can use the index property to sort by the enum value or when your enum options represent a sequence of values.

- **role**: [seller, manager, admin]

- **assignmentType**: [normal, override]

- **status**: [active, revoked, pending]

### Elastic Search Indexing

`userId` `storeId` `role` `assignmentType` `status`

Properties that are indexed in Elastic Search will be searchable via the Elastic Search API.
While all properties are stored in the elastic search index of the data object, only those marked for Elastic Search indexing will be available for search queries.

### Database Indexing

`userId` `storeId` `assignmentType`

Properties that are indexed in the database will be optimized for query performance, allowing for faster data retrieval.
Make a property indexed in the database if you want to use it frequently in query filters or sorting.

### Cache Select Properties

`userId` `storeId`

Cache select properties are used to collect data from Redis entity cache with a different key than the data object id.
This allows you to cache data that is not directly related to the data object id, but a frequently used filter.

### Relation Properties

`userId` `storeId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
You can define relations in the data object properties, which will be used to create foreign key constraints in the database.
For complex joins operations, Mindbricks supportsa BFF pattern, where you can view dynamic and static views based on Elastic Search Indexes.
Use db level relations for simple one-to-one or one-to-many relationships, and use BFF views for complex joins that require multiple data objects to be joined together.

- **userId**: ID
  Relation to `user`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

On Delete: Set Null
Required: Yes

- **storeId**: ID
  Relation to `store`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

On Delete: Set Null
Required: Yes

### Filter Properties

`userId` `storeId` `role` `assignmentType` `status`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as route parameters in the listing CRUD routes that have "Auto Params" enabled.

- **userId**: ID has a filter named `userId`

- **storeId**: ID has a filter named `storeId`

- **role**: Enum has a filter named `role`

- **assignmentType**: Enum has a filter named `assignmentType`

- **status**: Enum has a filter named `status`
