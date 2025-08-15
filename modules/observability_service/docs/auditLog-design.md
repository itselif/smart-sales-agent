# Service Design Specification - Object Design for auditLog

**salesai-observability-service** documentation

## Document Overview

This document outlines the object design for the `auditLog` model in our application. It includes details about the model's attributes, relationships, and any specific validation or business logic that applies.

## auditLog Data Object

### Object Overview

**Description:** Tracks every sensitive or critical action on the platform for audit/compliance. Includes what happened, who, when, entity, before/after data, store and user context, and extra trace fields.

This object represents a core data structure within the service and acts as the blueprint for database interaction, API generation, and business logic enforcement.
It is defined using the `ObjectSettings` pattern, which governs its behavior, access control, caching strategy, and integration points with other systems such as Stripe and Redis.

### Core Configuration

- **Soft Delete:** Enabled — Determines whether records are marked inactive (`isActive = false`) instead of being physically deleted.
- **Public Access:** No — If enabled, anonymous users may access this object’s data depending on route-level rules.
- **Tenant-Level Scope:** Yes — Enables data isolation per tenant by attaching a tenant ID field.

### Composite Indexes

- **store_user_time**: [storeId, userId, createdAt]
  This composite index is defined to optimize query performance for complex queries involving multiple fields.

The index also defines a conflict resolution strategy for duplicate key violations.

When a new record would violate this composite index, the following action will be taken:

**On Duplicate**: `doUpdate`

The existing record will be updated with the new data.No error will be thrown.

- **entity_type_id**: [entityType, entityId]
  This composite index is defined to optimize query performance for complex queries involving multiple fields.

The index also defines a conflict resolution strategy for duplicate key violations.

When a new record would violate this composite index, the following action will be taken:

**On Duplicate**: `doUpdate`

The existing record will be updated with the new data.No error will be thrown.

### Properties Schema

| Property       | Type   | Required | Description                                                                                                                               |
| -------------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `userId`       | ID     | Yes      | User who triggered the event/action being logged.                                                                                         |
| `actionType`   | String | Yes      | Categorical action descriptor (e.g., saleEdit, overrideGrant, reportDownload, adminOp, login, healthCheck, seedInject, repoSwitch, etc.). |
| `entityType`   | String | No       | Type of primary entity affected (e.g., saleTransaction, inventoryItem, reportFile, storeAssignment, seedData, metric, etc.).              |
| `entityId`     | String | No       | ID of the primary entity affected.                                                                                                        |
| `beforeData`   | Object | No       | Snapshot of relevant data before the action/change. (deep copy/structure as needed).                                                      |
| `afterData`    | Object | No       | Snapshot of data as it was after this action/change, if applicable.                                                                       |
| `severity`     | Enum   | Yes      | Severity/level of action event: 0=info, 1=warning, 2=critical.                                                                            |
| `message`      | Text   | No       | Human-readable text or trace providing context/description of the action.                                                                 |
| `traceContext` | Object | No       | Flexible object: request IDs, IPs, client/user-agent, trace IDs, or extra structured context for compliance and troubleshooting.          |
| `storeId`      | ID     | Yes      | An ID value to represent the tenant id of the store                                                                                       |

- Required properties are mandatory for creating objects and must be provided in the request body if no default value is set.

### Default Values

Default values are automatically assigned to properties when a new object is created, if no value is provided in the request body.
Since default values are applied on db level, they should be literal values, not expressions.If you want to use expressions, you can use transposed parameters in any crud route to set default values dynamically.

- **storeId**: 00000000-0000-0000-0000-000000000000

### Constant Properties

`userId` `actionType` `entityType` `entityId` `beforeData` `afterData` `severity` `traceContext` `storeId`

Constant properties are defined to be immutable after creation, meaning they cannot be updated or changed once set. They are typically used for properties that should remain constant throughout the object's lifecycle.
A property is set to be constant if the `Allow Update` option is set to `false`.

### Auto Update Properties

`userId` `message`

An update crud route created with the option `Auto Params` enabled will automatically update these properties with the provided values in the request body.
If you want to update any property in your own business logic not by user input, you can set the `Allow Auto Update` option to false.
These properties will be added to the update route's body parameters and can be updated by the user if any value is provided in the request body.

### Enum Properties

Enum properties are defined with a set of allowed values, ensuring that only valid options can be assigned to them.
The enum options value will be stored as strings in the database,
but when a data object is created an addtional property with the same name plus an idx suffix will be created, which will hold the index of the selected enum option.
You can use the index property to sort by the enum value or when your enum options represent a sequence of values.

- **severity**: [info, warning, critical]

### Elastic Search Indexing

`userId` `actionType` `entityType` `entityId` `severity` `message` `storeId`

Properties that are indexed in Elastic Search will be searchable via the Elastic Search API.
While all properties are stored in the elastic search index of the data object, only those marked for Elastic Search indexing will be available for search queries.

### Database Indexing

`userId` `actionType` `entityType` `severity` `storeId`

Properties that are indexed in the database will be optimized for query performance, allowing for faster data retrieval.
Make a property indexed in the database if you want to use it frequently in query filters or sorting.

### Secondary Key Properties

`storeId`

Secondary key properties are used to create an additional indexed identifiers for the data object, allowing for alternative access patterns.
Different than normal indexed properties, secondary keys will act as primary keys and Mindbricks will provide automatic secondary key db utility functions to access the data object by the secondary key.

### Relation Properties

`userId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
You can define relations in the data object properties, which will be used to create foreign key constraints in the database.
For complex joins operations, Mindbricks supportsa BFF pattern, where you can view dynamic and static views based on Elastic Search Indexes.
Use db level relations for simple one-to-one or one-to-many relationships, and use BFF views for complex joins that require multiple data objects to be joined together.

- **userId**: ID
  Relation to `user`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

On Delete: Set Null
Required: No

### Filter Properties

`userId` `actionType` `entityType` `entityId` `severity` `storeId`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as route parameters in the listing CRUD routes that have "Auto Params" enabled.

- **userId**: ID has a filter named `userId`

- **actionType**: String has a filter named `actionType`

- **entityType**: String has a filter named `entityType`

- **entityId**: String has a filter named `entityId`

- **severity**: Enum has a filter named `severity`

- **storeId**: ID has a filter named `storeId`
