# Service Design Specification - Object Design for reportPolicy

**salesai-reporting-service** documentation

## Document Overview

This document outlines the object design for the `reportPolicy` model in our application. It includes details about the model's attributes, relationships, and any specific validation or business logic that applies.

## reportPolicy Data Object

### Object Overview

**Description:** Admin-configurable reporting policy and metadata. Specifies allowed report types, retention, and generation params.

This object represents a core data structure within the service and acts as the blueprint for database interaction, API generation, and business logic enforcement.
It is defined using the `ObjectSettings` pattern, which governs its behavior, access control, caching strategy, and integration points with other systems such as Stripe and Redis.

### Core Configuration

- **Soft Delete:** Enabled — Determines whether records are marked inactive (`isActive = false`) instead of being physically deleted.
- **Public Access:** No — If enabled, anonymous users may access this object’s data depending on route-level rules.
- **Tenant-Level Scope:** No — Enables data isolation per tenant by attaching a tenant ID field.

### Properties Schema

| Property           | Type    | Required | Description                                                                                                                 |
| ------------------ | ------- | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| `reportType`       | Enum    | Yes      | Which type of report this policy applies to: 0=dailySales, 1=inventory, 2=analytics, 3=crossStoreSummary, 4=userActionAudit |
| `maxRetentionDays` | Integer | Yes      | Maximum retention of report files (in days).                                                                                |
| `allowedFormats`   | Enum    | Yes      | Which file formats are allowed for this report type. (Enum: 0=pdf, 1=csv, 2=xlsx)                                           |
| `description`      | Text    | No       | Policy description, admin notes, or compliance notes.                                                                       |

- Required properties are mandatory for creating objects and must be provided in the request body if no default value is set.

### Array Properties

`allowedFormats`

Array properties can hold multiple values and are indicated by the `[]` suffix in their type. Avoid using arrays in properties that are used for relations, as they will not work correctly.
Note that using connection objects instead of arrays is recommended for relations, as they provide better performance and flexibility.

### Default Values

Default values are automatically assigned to properties when a new object is created, if no value is provided in the request body.
Since default values are applied on db level, they should be literal values, not expressions.If you want to use expressions, you can use transposed parameters in any crud route to set default values dynamically.

- **maxRetentionDays**: 30

### Constant Properties

`reportType`

Constant properties are defined to be immutable after creation, meaning they cannot be updated or changed once set. They are typically used for properties that should remain constant throughout the object's lifecycle.
A property is set to be constant if the `Allow Update` option is set to `false`.

### Auto Update Properties

`reportType` `maxRetentionDays` `allowedFormats` `description`

An update crud route created with the option `Auto Params` enabled will automatically update these properties with the provided values in the request body.
If you want to update any property in your own business logic not by user input, you can set the `Allow Auto Update` option to false.
These properties will be added to the update route's body parameters and can be updated by the user if any value is provided in the request body.

### Enum Properties

Enum properties are defined with a set of allowed values, ensuring that only valid options can be assigned to them.
The enum options value will be stored as strings in the database,
but when a data object is created an addtional property with the same name plus an idx suffix will be created, which will hold the index of the selected enum option.
You can use the index property to sort by the enum value or when your enum options represent a sequence of values.

- **reportType**: [dailySales, inventory, analytics, crossStoreSummary, userActionAudit]

- **allowedFormats**: [pdf, csv, xlsx]

### Elastic Search Indexing

`reportType`

Properties that are indexed in Elastic Search will be searchable via the Elastic Search API.
While all properties are stored in the elastic search index of the data object, only those marked for Elastic Search indexing will be available for search queries.

### Database Indexing

`reportType`

Properties that are indexed in the database will be optimized for query performance, allowing for faster data retrieval.
Make a property indexed in the database if you want to use it frequently in query filters or sorting.

### Filter Properties

`reportType` `maxRetentionDays`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as route parameters in the listing CRUD routes that have "Auto Params" enabled.

- **reportType**: Enum has a filter named `reportType`

- **maxRetentionDays**: Integer has a filter named `maxRetentionDays`
