# Service Design Specification - Object Design for store

**salesai-storemanagement-service** documentation

## Document Overview

This document outlines the object design for the `store` model in our application. It includes details about the model's attributes, relationships, and any specific validation or business logic that applies.

## store Data Object

### Object Overview

**Description:** Represents a retail store location and its properties. Includes lifecycle metadata such as activation status and store-level policy configuration fields.

This object represents a core data structure within the service and acts as the blueprint for database interaction, API generation, and business logic enforcement.
It is defined using the `ObjectSettings` pattern, which governs its behavior, access control, caching strategy, and integration points with other systems such as Stripe and Redis.

### Core Configuration

- **Soft Delete:** Enabled — Determines whether records are marked inactive (`isActive = false`) instead of being physically deleted.
- **Public Access:** No — If enabled, anonymous users may access this object’s data depending on route-level rules.
- **Tenant-Level Scope:** No — Enables data isolation per tenant by attaching a tenant ID field.

### Composite Indexes

- **uniqueStoreName**: [name]
  This composite index is defined to optimize query performance for complex queries involving multiple fields.

The index also defines a conflict resolution strategy for duplicate key violations.

When a new record would violate this composite index, the following action will be taken:

**On Duplicate**: `throwError`

An error will be thrown, preventing the insertion of conflicting data.

### Properties Schema

| Property   | Type    | Required | Description                                                |
| ---------- | ------- | -------- | ---------------------------------------------------------- |
| `name`     | String  | Yes      | Short, human-readable store name (display).                |
| `fullname` | String  | No       | Full/store legal name (used for reporting, invoices, etc). |
| `city`     | String  | No       | The city/location in which this store operates.            |
| `avatar`   | String  | No       | Public avatar image URL for the store (branding).          |
| `active`   | Boolean | Yes      | Flag marking this store as currently operational/active.   |

- Required properties are mandatory for creating objects and must be provided in the request body if no default value is set.

### Default Values

Default values are automatically assigned to properties when a new object is created, if no value is provided in the request body.
Since default values are applied on db level, they should be literal values, not expressions.If you want to use expressions, you can use transposed parameters in any crud route to set default values dynamically.

- **active**: true

### Auto Update Properties

`name` `fullname` `city` `avatar` `active`

An update crud route created with the option `Auto Params` enabled will automatically update these properties with the provided values in the request body.
If you want to update any property in your own business logic not by user input, you can set the `Allow Auto Update` option to false.
These properties will be added to the update route's body parameters and can be updated by the user if any value is provided in the request body.

### Elastic Search Indexing

`name` `fullname` `city` `active`

Properties that are indexed in Elastic Search will be searchable via the Elastic Search API.
While all properties are stored in the elastic search index of the data object, only those marked for Elastic Search indexing will be available for search queries.

### Database Indexing

`name`

Properties that are indexed in the database will be optimized for query performance, allowing for faster data retrieval.
Make a property indexed in the database if you want to use it frequently in query filters or sorting.

### Unique Properties

`name`

Unique properties are enforced to have distinct values across all instances of the data object, preventing duplicate entries.
Note that a unique property is automatically indexed in the database so you will not need to set the `Indexed in DB` option.

### Filter Properties

`name` `fullname` `city` `active`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as route parameters in the listing CRUD routes that have "Auto Params" enabled.

- **name**: String has a filter named `name`

- **fullname**: String has a filter named `fullname`

- **city**: String has a filter named `city`

- **active**: Boolean has a filter named `active`
