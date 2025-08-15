# Service Design Specification - Object Design for userGroup

**salesai-auth-service** documentation

## Document Overview

This document outlines the object design for the `userGroup` model in our application. It includes details about the model's attributes, relationships, and any specific validation or business logic that applies.

## userGroup Data Object

### Object Overview

**Description:** A data object that stores the user group information.

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

### Properties Schema

| Property    | Type   | Required | Description                                  |
| ----------- | ------ | -------- | -------------------------------------------- |
| `groupName` | String | Yes      | A string value to represent the group name.  |
| `avatar`    | String | No       | A string value to represent the groups icon. |

- Required properties are mandatory for creating objects and must be provided in the request body if no default value is set.

### Auto Update Properties

`groupName` `avatar`

An update crud route created with the option `Auto Params` enabled will automatically update these properties with the provided values in the request body.
If you want to update any property in your own business logic not by user input, you can set the `Allow Auto Update` option to false.
These properties will be added to the update route's body parameters and can be updated by the user if any value is provided in the request body.

### Hashed Properties

`avatar`

Hashed properties are stored in the database as a hash value, providing an additional layer of security for sensitive data.

### Elastic Search Indexing

`groupName`

Properties that are indexed in Elastic Search will be searchable via the Elastic Search API.
While all properties are stored in the elastic search index of the data object, only those marked for Elastic Search indexing will be available for search queries.

### Cache Select Properties

`groupName`

Cache select properties are used to collect data from Redis entity cache with a different key than the data object id.
This allows you to cache data that is not directly related to the data object id, but a frequently used filter.

### Filter Properties

`groupName` `avatar`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as route parameters in the listing CRUD routes that have "Auto Params" enabled.

- **groupName**: String has a filter named `groupName`

- **avatar**: String has a filter named `avatar`
