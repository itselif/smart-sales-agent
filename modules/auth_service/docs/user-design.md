# Service Design Specification - Object Design for user

**salesai-auth-service** documentation

## Document Overview

This document outlines the object design for the `user` model in our application. It includes details about the model's attributes, relationships, and any specific validation or business logic that applies.

## user Data Object

### Object Overview

**Description:** A data object that stores the user information and handles login settings.

This object represents a core data structure within the service and acts as the blueprint for database interaction, API generation, and business logic enforcement.
It is defined using the `ObjectSettings` pattern, which governs its behavior, access control, caching strategy, and integration points with other systems such as Stripe and Redis.

### Core Configuration

- **Soft Delete:** Enabled — Determines whether records are marked inactive (`isActive = false`) instead of being physically deleted.
- **Public Access:** No — If enabled, anonymous users may access this object’s data depending on route-level rules.
- **Tenant-Level Scope:** Yes — Enables data isolation per tenant by attaching a tenant ID field.

### Redis Entity Caching

This data object is configured for Redis entity caching, which improves data retrieval performance by storing frequently accessed data in Redis.
Each time a new instance is created, updated or deleted, the cache is updated accordingly. Any get requests by id will first check the cache before querying the database.
If you want to use the cache by other select criteria, you can configure any data property as a Redis cluster.

### Composite Indexes

- **UniqueEmailInForATenant**: [storeId, email]
  This composite index is defined to optimize query performance for complex queries involving multiple fields.

The index also defines a conflict resolution strategy for duplicate key violations.

When a new record would violate this composite index, the following action will be taken:

**On Duplicate**: `throwError`

An error will be thrown, preventing the insertion of conflicting data.

### Properties Schema

| Property        | Type    | Required | Description                                                                       |
| --------------- | ------- | -------- | --------------------------------------------------------------------------------- |
| `email`         | String  | Yes      | A string value to represent the user&#39;s email.                                 |
| `password`      | String  | Yes      | A string value to represent the user&#39;s password. It will be stored as hashed. |
| `fullname`      | String  | Yes      | A string value to represent the fullname of the user                              |
| `avatar`        | String  | No       | The avatar url of the user. A random avatar will be generated if not provided     |
| `emailVerified` | Boolean | Yes      | A boolean value to represent the email verification status of the user.           |
| `storeId`       | ID      | Yes      | An ID value to represent the tenant id of the store                               |

- Required properties are mandatory for creating objects and must be provided in the request body if no default value is set.

### Default Values

Default values are automatically assigned to properties when a new object is created, if no value is provided in the request body.
Since default values are applied on db level, they should be literal values, not expressions.If you want to use expressions, you can use transposed parameters in any crud route to set default values dynamically.

- **storeId**: 00000000-0000-0000-0000-000000000000

### Always Create with Default Values

Some of the default values are set to be always used when creating a new object, even if the property value is provided in the request body. It ensures that the property is always initialized with a default value when the object is created.

- **emailVerified**: Will be created with value `false`

### Constant Properties

`email` `storeId`

Constant properties are defined to be immutable after creation, meaning they cannot be updated or changed once set. They are typically used for properties that should remain constant throughout the object's lifecycle.
A property is set to be constant if the `Allow Update` option is set to `false`.

### Auto Update Properties

`fullname` `avatar`

An update crud route created with the option `Auto Params` enabled will automatically update these properties with the provided values in the request body.
If you want to update any property in your own business logic not by user input, you can set the `Allow Auto Update` option to false.
These properties will be added to the update route's body parameters and can be updated by the user if any value is provided in the request body.

### Hashed Properties

`password`

Hashed properties are stored in the database as a hash value, providing an additional layer of security for sensitive data.

### Elastic Search Indexing

`email` `fullname` `emailVerified` `storeId`

Properties that are indexed in Elastic Search will be searchable via the Elastic Search API.
While all properties are stored in the elastic search index of the data object, only those marked for Elastic Search indexing will be available for search queries.

### Database Indexing

`email` `storeId`

Properties that are indexed in the database will be optimized for query performance, allowing for faster data retrieval.
Make a property indexed in the database if you want to use it frequently in query filters or sorting.

### Cache Select Properties

`email`

Cache select properties are used to collect data from Redis entity cache with a different key than the data object id.
This allows you to cache data that is not directly related to the data object id, but a frequently used filter.

### Secondary Key Properties

`email` `storeId`

Secondary key properties are used to create an additional indexed identifiers for the data object, allowing for alternative access patterns.
Different than normal indexed properties, secondary keys will act as primary keys and Mindbricks will provide automatic secondary key db utility functions to access the data object by the secondary key.

### Filter Properties

`email` `password` `fullname` `avatar` `emailVerified` `storeId`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as route parameters in the listing CRUD routes that have "Auto Params" enabled.

- **email**: String has a filter named `email`

- **password**: String has a filter named `password`

- **fullname**: String has a filter named `fullname`

- **avatar**: String has a filter named `avatar`

- **emailVerified**: Boolean has a filter named `emailVerified`

- **storeId**: ID has a filter named `storeId`
