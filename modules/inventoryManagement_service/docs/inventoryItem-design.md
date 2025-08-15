# Service Design Specification - Object Design for inventoryItem

**salesai-inventorymanagement-service** documentation

## Document Overview

This document outlines the object design for the `inventoryItem` model in our application. It includes details about the model's attributes, relationships, and any specific validation or business logic that applies.

## inventoryItem Data Object

### Object Overview

**Description:** Tracks the quantity and status of a specific product in a given store, including thresholds for low-stock alerts and isolation by store.

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

- **Smart Caching is activated:**
  A data object instance will only be cached when it is accessed for the first time.
  TTL (time-to-live) is dynamically calculated based on access frequency, which is useful for large datasets with volatile usage patterns.
  Each data instance has 15 minutes of TTL and in each access, the TTL is extended by 15 minutes.
  If the data is not accessed for 15 minutes, it will be removed from the cache.

- **Cache Criteria:**

```js
{"isActive": true, "status": {"$eq": 0}}
```

This object is only cached if this criteria is met.

The criteria is checked during all operations, including read operations.
If your criteria is all about the data properties, you can use the `checkCriteriaOnlyInCreateAndUpdates` option to improve performance.

### Composite Indexes

- **inventoryByStoreProduct**: [storeId, productId]
  This composite index is defined to optimize query performance for complex queries involving multiple fields.

The index also defines a conflict resolution strategy for duplicate key violations.

When a new record would violate this composite index, the following action will be taken:

**On Duplicate**: `doUpdate`

The existing record will be updated with the new data.No error will be thrown.

### Properties Schema

| Property            | Type    | Required | Description                                                                                             |
| ------------------- | ------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `productId`         | String  | Yes      | Unique product SKU or identifier (string, as no central product object is currently defined).           |
| `quantity`          | Integer | Yes      | The current quantity of this product in the store&#39;s inventory.                                      |
| `status`            | Enum    | Yes      | Status of inventory item: 0=in-stock, 1=out-of-stock, 2=low-stock, 3=damaged, 4=reserved                |
| `lowStockThreshold` | Integer | Yes      | Threshold quantity; if quantity &lt;= this value, the item is considered low-stock and triggers alerts. |
| `lastSyncTimestamp` | Date    | No       | Timestamp when the inventoryItem was last synchronized with remote/manual updates.                      |
| `storeId`           | ID      | Yes      | An ID value to represent the tenant id of the store                                                     |

- Required properties are mandatory for creating objects and must be provided in the request body if no default value is set.

### Default Values

Default values are automatically assigned to properties when a new object is created, if no value is provided in the request body.
Since default values are applied on db level, they should be literal values, not expressions.If you want to use expressions, you can use transposed parameters in any crud route to set default values dynamically.

- **lowStockThreshold**: 5
- **storeId**: 00000000-0000-0000-0000-000000000000

### Constant Properties

`productId` `storeId`

Constant properties are defined to be immutable after creation, meaning they cannot be updated or changed once set. They are typically used for properties that should remain constant throughout the object's lifecycle.
A property is set to be constant if the `Allow Update` option is set to `false`.

### Auto Update Properties

`quantity` `status` `lowStockThreshold` `lastSyncTimestamp`

An update crud route created with the option `Auto Params` enabled will automatically update these properties with the provided values in the request body.
If you want to update any property in your own business logic not by user input, you can set the `Allow Auto Update` option to false.
These properties will be added to the update route's body parameters and can be updated by the user if any value is provided in the request body.

### Enum Properties

Enum properties are defined with a set of allowed values, ensuring that only valid options can be assigned to them.
The enum options value will be stored as strings in the database,
but when a data object is created an addtional property with the same name plus an idx suffix will be created, which will hold the index of the selected enum option.
You can use the index property to sort by the enum value or when your enum options represent a sequence of values.

- **status**: [inStock, outOfStock, lowStock, damaged, reserved]

### Elastic Search Indexing

`productId` `quantity` `status` `storeId`

Properties that are indexed in Elastic Search will be searchable via the Elastic Search API.
While all properties are stored in the elastic search index of the data object, only those marked for Elastic Search indexing will be available for search queries.

### Database Indexing

`productId` `storeId`

Properties that are indexed in the database will be optimized for query performance, allowing for faster data retrieval.
Make a property indexed in the database if you want to use it frequently in query filters or sorting.

### Redis Cluster Properties

`productId` `quantity` `status`

Cluster properties are used to group related data in Redis, and used to invalidate the query cache more precisely.
If no cluster property is set, the data object query cache will be invalidated for all instances of the data object when any instance is created, updated or deleted.
For example, if you have a `userId` property that is used to cluster a task data query in Redis,
when a new task is created, the query caches which have different userId filters will be reserved, and only the queries that have the same userId filter or have no filter at all will be invalidated.

### Cache Select Properties

`productId` `quantity` `status`

Cache select properties are used to collect data from Redis entity cache with a different key than the data object id.
This allows you to cache data that is not directly related to the data object id, but a frequently used filter.

### Secondary Key Properties

`storeId`

Secondary key properties are used to create an additional indexed identifiers for the data object, allowing for alternative access patterns.
Different than normal indexed properties, secondary keys will act as primary keys and Mindbricks will provide automatic secondary key db utility functions to access the data object by the secondary key.

### Filter Properties

`productId` `quantity` `status` `storeId`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as route parameters in the listing CRUD routes that have "Auto Params" enabled.

- **productId**: String has a filter named `productId`

- **quantity**: Integer has a filter named `quantity`

- **status**: Enum has a filter named `status`

- **storeId**: ID has a filter named `storeId`
