# Service Design Specification - Object Design for metricDatapoint

**salesai-observability-service** documentation

## Document Overview

This document outlines the object design for the `metricDatapoint` model in our application. It includes details about the model's attributes, relationships, and any specific validation or business logic that applies.

## metricDatapoint Data Object

### Object Overview

**Description:** Stores a single time-series business/system/platform metric (e.g., salesCount, errorRate, latency), with target entity, granularity, observed value, and anomaly flags.

This object represents a core data structure within the service and acts as the blueprint for database interaction, API generation, and business logic enforcement.
It is defined using the `ObjectSettings` pattern, which governs its behavior, access control, caching strategy, and integration points with other systems such as Stripe and Redis.

### Core Configuration

- **Soft Delete:** Enabled — Determines whether records are marked inactive (`isActive = false`) instead of being physically deleted.
- **Public Access:** No — If enabled, anonymous users may access this object’s data depending on route-level rules.
- **Tenant-Level Scope:** No — Enables data isolation per tenant by attaching a tenant ID field.

### Composite Indexes

- **metric_type_time**: [metricType, targetType, targetId, periodStart]
  This composite index is defined to optimize query performance for complex queries involving multiple fields.

The index also defines a conflict resolution strategy for duplicate key violations.

When a new record would violate this composite index, the following action will be taken:

**On Duplicate**: `doUpdate`

The existing record will be updated with the new data.No error will be thrown.

### Properties Schema

| Property           | Type    | Required | Description                                                                                       |
| ------------------ | ------- | -------- | ------------------------------------------------------------------------------------------------- |
| `metricType`       | String  | Yes      | Type of metric (e.g., salesCount, inventoryLow, systemLatency, apiError, healthCheck, loginCount) |
| `targetType`       | String  | Yes      | Type of target: system, service, store, user, etc.                                                |
| `targetId`         | String  | No       | ID of the target (storeId, service name, userId, etc.) as appropriate.                            |
| `periodStart`      | Date    | Yes      | Start timestamp for the metric period (e.g. day, hour, minute, etc.).                             |
| `granularity`      | String  | Yes      | Granularity/resolution of the datapoint (minute/hour/day/etc).                                    |
| `value`            | Double  | Yes      | Value of the metric datapoint.                                                                    |
| `flagAnomalous`    | Boolean | No       | Indicates the datapoint is an anomaly (detected or flagged).                                      |
| `observedByUserId` | ID      | No       | User who reported/flagged/created this metric data, if manually added or updated (optional).      |
| `context`          | Object  | No       | Free-form context for the metric (cause, dimension, tags, error codes, etc.)                      |

- Required properties are mandatory for creating objects and must be provided in the request body if no default value is set.

### Default Values

Default values are automatically assigned to properties when a new object is created, if no value is provided in the request body.
Since default values are applied on db level, they should be literal values, not expressions.If you want to use expressions, you can use transposed parameters in any crud route to set default values dynamically.

- **granularity**: minute

### Constant Properties

`metricType` `targetType` `targetId` `periodStart` `granularity` `observedByUserId`

Constant properties are defined to be immutable after creation, meaning they cannot be updated or changed once set. They are typically used for properties that should remain constant throughout the object's lifecycle.
A property is set to be constant if the `Allow Update` option is set to `false`.

### Auto Update Properties

`value` `flagAnomalous` `context`

An update crud route created with the option `Auto Params` enabled will automatically update these properties with the provided values in the request body.
If you want to update any property in your own business logic not by user input, you can set the `Allow Auto Update` option to false.
These properties will be added to the update route's body parameters and can be updated by the user if any value is provided in the request body.

### Elastic Search Indexing

`metricType` `targetType` `targetId` `periodStart` `granularity` `flagAnomalous`

Properties that are indexed in Elastic Search will be searchable via the Elastic Search API.
While all properties are stored in the elastic search index of the data object, only those marked for Elastic Search indexing will be available for search queries.

### Database Indexing

`metricType` `targetType` `targetId` `periodStart`

Properties that are indexed in the database will be optimized for query performance, allowing for faster data retrieval.
Make a property indexed in the database if you want to use it frequently in query filters or sorting.

### Relation Properties

`observedByUserId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
You can define relations in the data object properties, which will be used to create foreign key constraints in the database.
For complex joins operations, Mindbricks supportsa BFF pattern, where you can view dynamic and static views based on Elastic Search Indexes.
Use db level relations for simple one-to-one or one-to-many relationships, and use BFF views for complex joins that require multiple data objects to be joined together.

- **observedByUserId**: ID
  Relation to `user`.id

The target object is a sibling object, meaning that the relation is a many-to-one or one-to-one relationship from this object to the target.

On Delete: Set Null
Required: No

### Filter Properties

`metricType` `targetType` `targetId` `periodStart` `granularity` `flagAnomalous` `observedByUserId`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as route parameters in the listing CRUD routes that have "Auto Params" enabled.

- **metricType**: String has a filter named `metricType`

- **targetType**: String has a filter named `targetType`

- **targetId**: String has a filter named `targetId`

- **periodStart**: Date has a filter named `periodStart`

- **granularity**: String has a filter named `granularity`

- **flagAnomalous**: Boolean has a filter named `flagAnomalous`

- **observedByUserId**: ID has a filter named `observedByUserId`
