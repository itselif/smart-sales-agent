# Service Design Specification - Object Design for reportRequest

**salesai-reporting-service** documentation

## Document Overview

This document outlines the object design for the `reportRequest` model in our application. It includes details about the model's attributes, relationships, and any specific validation or business logic that applies.

## reportRequest Data Object

### Object Overview

**Description:** Captures a user&#39;s request to generate a report, including all parameters such as report type, date range, store(s), and output format. Tracks status for audit and process management.

This object represents a core data structure within the service and acts as the blueprint for database interaction, API generation, and business logic enforcement.
It is defined using the `ObjectSettings` pattern, which governs its behavior, access control, caching strategy, and integration points with other systems such as Stripe and Redis.

### Core Configuration

- **Soft Delete:** Enabled — Determines whether records are marked inactive (`isActive = false`) instead of being physically deleted.
- **Public Access:** No — If enabled, anonymous users may access this object’s data depending on route-level rules.
- **Tenant-Level Scope:** No — Enables data isolation per tenant by attaching a tenant ID field.

### Properties Schema

| Property            | Type   | Required | Description                                                                                              |
| ------------------- | ------ | -------- | -------------------------------------------------------------------------------------------------------- |
| `requestedByUserId` | ID     | Yes      | ID of the user who requests the report.                                                                  |
| `reportType`        | Enum   | Yes      | Type of report requested: 0=dailySales, 1=inventory, 2=analytics, 3=crossStoreSummary, 4=userActionAudit |
| `storeIds`          | ID     | Yes      | IDs of stores covered by the report request (can be one or multiple, depending on permission).           |
| `dateFrom`          | Date   | Yes      | Report start date or single day for daily reports.                                                       |
| `dateTo`            | Date   | Yes      | Report end date (can be same as dateFrom for one day reports).                                           |
| `productIds`        | String | No       | SKUs or IDs of products relevant to the report, optional.                                                |
| `format`            | Enum   | Yes      | Format for output file(s): 0=pdf, 1=csv, 2=xlsx                                                          |
| `status`            | Enum   | Yes      | Status of the report request. 0=pending, 1=processing, 2=complete, 3=failed                              |

- Required properties are mandatory for creating objects and must be provided in the request body if no default value is set.

### Array Properties

`storeIds` `productIds`

Array properties can hold multiple values and are indicated by the `[]` suffix in their type. Avoid using arrays in properties that are used for relations, as they will not work correctly.
Note that using connection objects instead of arrays is recommended for relations, as they provide better performance and flexibility.

### Constant Properties

`requestedByUserId` `reportType` `storeIds` `dateFrom` `dateTo` `productIds` `format`

Constant properties are defined to be immutable after creation, meaning they cannot be updated or changed once set. They are typically used for properties that should remain constant throughout the object's lifecycle.
A property is set to be constant if the `Allow Update` option is set to `false`.

### Auto Update Properties

`requestedByUserId` `reportType` `storeIds` `dateFrom` `dateTo` `productIds` `format` `status`

An update crud route created with the option `Auto Params` enabled will automatically update these properties with the provided values in the request body.
If you want to update any property in your own business logic not by user input, you can set the `Allow Auto Update` option to false.
These properties will be added to the update route's body parameters and can be updated by the user if any value is provided in the request body.

### Enum Properties

Enum properties are defined with a set of allowed values, ensuring that only valid options can be assigned to them.
The enum options value will be stored as strings in the database,
but when a data object is created an addtional property with the same name plus an idx suffix will be created, which will hold the index of the selected enum option.
You can use the index property to sort by the enum value or when your enum options represent a sequence of values.

- **reportType**: [dailySales, inventory, analytics, crossStoreSummary, userActionAudit]

- **format**: [pdf, csv, xlsx]

- **status**: [pending, processing, complete, failed]

### Elastic Search Indexing

`requestedByUserId` `reportType` `storeIds` `dateFrom` `dateTo` `status`

Properties that are indexed in Elastic Search will be searchable via the Elastic Search API.
While all properties are stored in the elastic search index of the data object, only those marked for Elastic Search indexing will be available for search queries.

### Database Indexing

`requestedByUserId`

Properties that are indexed in the database will be optimized for query performance, allowing for faster data retrieval.
Make a property indexed in the database if you want to use it frequently in query filters or sorting.

### Relation Properties

`requestedByUserId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
You can define relations in the data object properties, which will be used to create foreign key constraints in the database.
For complex joins operations, Mindbricks supportsa BFF pattern, where you can view dynamic and static views based on Elastic Search Indexes.
Use db level relations for simple one-to-one or one-to-many relationships, and use BFF views for complex joins that require multiple data objects to be joined together.

- **requestedByUserId**: ID
  Relation to `user`.id

The target object is a parent object, meaning that the relation is a one-to-many relationship from target to this object.

On Delete: Set Null
Required: Yes

### Session Data Properties

`requestedByUserId`

Session data properties are used to store data that is specific to the user session, allowing for personalized experiences and temporary data storage.
If a property is configured as session data, it will be automatically mapped to the related field in the user session during CRUD operations.
Note that session data properties can not be mutated by the user, but only by the system.

- **requestedByUserId**: ID property will be mapped to the session parameter `userId`.

This property is also used to store the owner of the session data, allowing for ownership checks and access control.

### Filter Properties

`requestedByUserId` `reportType` `storeIds` `dateFrom` `dateTo` `productIds` `format` `status`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as route parameters in the listing CRUD routes that have "Auto Params" enabled.

- **requestedByUserId**: ID has a filter named `requestedByUserId`

- **reportType**: Enum has a filter named `reportType`

- **storeIds**: ID has a filter named `storeId`

- **dateFrom**: Date has a filter named `dateFrom`

- **dateTo**: Date has a filter named `dateTo`

- **productIds**: String has a filter named `productId`

- **format**: Enum has a filter named `format`

- **status**: Enum has a filter named `status`
