# Service Design Specification - Object Design for anomalyEvent

**salesai-observability-service** documentation

## Document Overview

This document outlines the object design for the `anomalyEvent` model in our application. It includes details about the model's attributes, relationships, and any specific validation or business logic that applies.

## anomalyEvent Data Object

### Object Overview

**Description:** Represents a detected or reported anomaly (e.g., suspicious, failed or policy-violating activity) for compliance/investigation. Tracks type, source, severity, and review status.

This object represents a core data structure within the service and acts as the blueprint for database interaction, API generation, and business logic enforcement.
It is defined using the `ObjectSettings` pattern, which governs its behavior, access control, caching strategy, and integration points with other systems such as Stripe and Redis.

### Core Configuration

- **Soft Delete:** Enabled — Determines whether records are marked inactive (`isActive = false`) instead of being physically deleted.
- **Public Access:** No — If enabled, anonymous users may access this object’s data depending on route-level rules.
- **Tenant-Level Scope:** No — Enables data isolation per tenant by attaching a tenant ID field.

### Composite Indexes

- **anomaly_type_time**: [anomalyType, detectedAt, status]
  This composite index is defined to optimize query performance for complex queries involving multiple fields.

The index also defines a conflict resolution strategy for duplicate key violations.

When a new record would violate this composite index, the following action will be taken:

**On Duplicate**: `doUpdate`

The existing record will be updated with the new data.No error will be thrown.

### Properties Schema

| Property            | Type   | Required | Description                                                                                                             |
| ------------------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `anomalyType`       | String | Yes      | Type of anomaly (e.g., dataTamper, suspiciousEdit, fraud, systemFailure, policyBreach, invalidLogin, reportAbuse, etc.) |
| `triggeredByUserId` | ID     | No       | User who reported or triggered the anomaly, if any.                                                                     |
| `affectedUserId`    | ID     | No       | User affected by anomaly (if different from trigger).                                                                   |
| `storeId`           | ID     | No       | Store linked to the anomaly, if relevant.                                                                               |
| `relatedEntityType` | String | No       | Type of related entity (metric, auditLog, saleTransaction, etc.), if anomaly links to another record.                   |
| `relatedEntityId`   | String | No       | ID of related entity record.                                                                                            |
| `description`       | Text   | No       | Description/details regarding the anomaly for compliance, notification, and investigation.                              |
| `detectedAt`        | Date   | Yes      | Date/time anomaly was detected/flagged.                                                                                 |
| `severity`          | Enum   | Yes      | Severity of anomaly: 0=low, 1=medium, 2=high, 3=critical.                                                               |
| `status`            | Enum   | Yes      | Status of event: 0=open, 1=investigating, 2=resolved, 3=closed.                                                         |
| `reviewedByUserId`  | ID     | No       | User who performed/closed/reviewed the anomaly (e.g., admin or investigator).                                           |

- Required properties are mandatory for creating objects and must be provided in the request body if no default value is set.

### Default Values

Default values are automatically assigned to properties when a new object is created, if no value is provided in the request body.
Since default values are applied on db level, they should be literal values, not expressions.If you want to use expressions, you can use transposed parameters in any crud route to set default values dynamically.

- **severity**: 1

### Constant Properties

`anomalyType` `triggeredByUserId` `affectedUserId` `storeId` `relatedEntityType` `relatedEntityId` `detectedAt` `severity`

Constant properties are defined to be immutable after creation, meaning they cannot be updated or changed once set. They are typically used for properties that should remain constant throughout the object's lifecycle.
A property is set to be constant if the `Allow Update` option is set to `false`.

### Auto Update Properties

`description` `status` `reviewedByUserId`

An update crud route created with the option `Auto Params` enabled will automatically update these properties with the provided values in the request body.
If you want to update any property in your own business logic not by user input, you can set the `Allow Auto Update` option to false.
These properties will be added to the update route's body parameters and can be updated by the user if any value is provided in the request body.

### Enum Properties

Enum properties are defined with a set of allowed values, ensuring that only valid options can be assigned to them.
The enum options value will be stored as strings in the database,
but when a data object is created an addtional property with the same name plus an idx suffix will be created, which will hold the index of the selected enum option.
You can use the index property to sort by the enum value or when your enum options represent a sequence of values.

- **severity**: [low, medium, high, critical]

- **status**: [open, investigating, resolved, closed]

### Elastic Search Indexing

`anomalyType` `triggeredByUserId` `storeId` `description` `detectedAt` `severity` `status`

Properties that are indexed in Elastic Search will be searchable via the Elastic Search API.
While all properties are stored in the elastic search index of the data object, only those marked for Elastic Search indexing will be available for search queries.

### Database Indexing

`anomalyType` `detectedAt` `severity` `status`

Properties that are indexed in the database will be optimized for query performance, allowing for faster data retrieval.
Make a property indexed in the database if you want to use it frequently in query filters or sorting.

### Relation Properties

`triggeredByUserId` `affectedUserId` `storeId` `reviewedByUserId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
You can define relations in the data object properties, which will be used to create foreign key constraints in the database.
For complex joins operations, Mindbricks supportsa BFF pattern, where you can view dynamic and static views based on Elastic Search Indexes.
Use db level relations for simple one-to-one or one-to-many relationships, and use BFF views for complex joins that require multiple data objects to be joined together.

- **triggeredByUserId**: ID
  Relation to `user`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

On Delete: Set Null
Required: No

- **affectedUserId**: ID
  Relation to `user`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

On Delete: Set Null
Required: No

- **storeId**: ID
  Relation to `store`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

On Delete: Set Null
Required: No

- **reviewedByUserId**: ID
  Relation to `user`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

On Delete: Set Null
Required: No

### Filter Properties

`anomalyType` `triggeredByUserId` `affectedUserId` `storeId` `relatedEntityType` `relatedEntityId` `detectedAt` `severity` `status` `reviewedByUserId`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as route parameters in the listing CRUD routes that have "Auto Params" enabled.

- **anomalyType**: String has a filter named `anomalyType`

- **triggeredByUserId**: ID has a filter named `triggeredByUserId`

- **affectedUserId**: ID has a filter named `affectedUserId`

- **storeId**: ID has a filter named `storeId`

- **relatedEntityType**: String has a filter named `relatedEntityType`

- **relatedEntityId**: String has a filter named `relatedEntityId`

- **detectedAt**: Date has a filter named `detectedAt`

- **severity**: Enum has a filter named `severity`

- **status**: Enum has a filter named `status`

- **reviewedByUserId**: ID has a filter named `reviewedByUserId`
