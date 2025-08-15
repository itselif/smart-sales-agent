# Service Design Specification - Object Design for store

**salesai-auth-service** documentation

## Document Overview

This document outlines the object design for the `store` model in our application. It includes details about the model's attributes, relationships, and any specific validation or business logic that applies.

## store Data Object

### Object Overview

**Description:** A data object that stores the information for store

This object represents a core data structure within the service and acts as the blueprint for database interaction, API generation, and business logic enforcement.
It is defined using the `ObjectSettings` pattern, which governs its behavior, access control, caching strategy, and integration points with other systems such as Stripe and Redis.

### Core Configuration

- **Soft Delete:** Enabled — Determines whether records are marked inactive (`isActive = false`) instead of being physically deleted.
- **Public Access:** No — If enabled, anonymous users may access this object’s data depending on route-level rules.
- **Tenant-Level Scope:** No — Enables data isolation per tenant by attaching a tenant ID field.

### Redis Entity Caching

This data object is configured for Redis entity caching, which improves data retrieval performance by storing frequently accessed data in Redis.
Each time a new instance is created, updated or deleted, the cache is updated accordingly. Any get requests by id will first check the cache before querying the database.
If you want to use the cache by other select criteria, you can configure any data property as a Redis cluster.

### Properties Schema

| Property   | Type   | Required | Description                                                                                              |
| ---------- | ------ | -------- | -------------------------------------------------------------------------------------------------------- |
| `name`     | String | Yes      | A string value to represent one word name of the store                                                   |
| `codename` | String | Yes      | A string value to represent a unique code name for the store which is generated automatically using name |
| `fullname` | String | Yes      | A string value to represent the fullname of the store                                                    |
| `avatar`   | String | No       | A string value represent the url of the store avatar. Keep null for random avatar.                       |
| `ownerId`  | ID     | Yes      | An ID value to represent the user id of store owner who created the tenant                               |

- Required properties are mandatory for creating objects and must be provided in the request body if no default value is set.

### Constant Properties

`ownerId`

Constant properties are defined to be immutable after creation, meaning they cannot be updated or changed once set. They are typically used for properties that should remain constant throughout the object's lifecycle.
A property is set to be constant if the `Allow Update` option is set to `false`.

### Auto Update Properties

`name` `fullname` `avatar`

An update crud route created with the option `Auto Params` enabled will automatically update these properties with the provided values in the request body.
If you want to update any property in your own business logic not by user input, you can set the `Allow Auto Update` option to false.
These properties will be added to the update route's body parameters and can be updated by the user if any value is provided in the request body.

### Elastic Search Indexing

`name` `codename` `fullname` `ownerId`

Properties that are indexed in Elastic Search will be searchable via the Elastic Search API.
While all properties are stored in the elastic search index of the data object, only those marked for Elastic Search indexing will be available for search queries.

### Database Indexing

`ownerId`

Properties that are indexed in the database will be optimized for query performance, allowing for faster data retrieval.
Make a property indexed in the database if you want to use it frequently in query filters or sorting.

### Unique Properties

`codename`

Unique properties are enforced to have distinct values across all instances of the data object, preventing duplicate entries.
Note that a unique property is automatically indexed in the database so you will not need to set the `Indexed in DB` option.

### Secondary Key Properties

`ownerId`

Secondary key properties are used to create an additional indexed identifiers for the data object, allowing for alternative access patterns.
Different than normal indexed properties, secondary keys will act as primary keys and Mindbricks will provide automatic secondary key db utility functions to access the data object by the secondary key.

### Relation Properties

`ownerId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
You can define relations in the data object properties, which will be used to create foreign key constraints in the database.
For complex joins operations, Mindbricks supportsa BFF pattern, where you can view dynamic and static views based on Elastic Search Indexes.
Use db level relations for simple one-to-one or one-to-many relationships, and use BFF views for complex joins that require multiple data objects to be joined together.

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

This property is also used to store the owner of the session data, allowing for ownership checks and access control.

### Filter Properties

`name` `codename` `fullname` `avatar` `ownerId`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as route parameters in the listing CRUD routes that have "Auto Params" enabled.

- **name**: String has a filter named `name`

- **codename**: String has a filter named `codename`

- **fullname**: String has a filter named `fullname`

- **avatar**: String has a filter named `avatar`

- **ownerId**: ID has a filter named `ownerId`
