# Service Design Specification - Object Design for reportFile

**salesai-reporting-service** documentation

## Document Overview

This document outlines the object design for the `reportFile` model in our application. It includes details about the model's attributes, relationships, and any specific validation or business logic that applies.

## reportFile Data Object

### Object Overview

**Description:** Represents a generated report file, its secure access URL, format, expiry, and download/audit metadata. Links to reportRequest for traceability.

This object represents a core data structure within the service and acts as the blueprint for database interaction, API generation, and business logic enforcement.
It is defined using the `ObjectSettings` pattern, which governs its behavior, access control, caching strategy, and integration points with other systems such as Stripe and Redis.

### Core Configuration

- **Soft Delete:** Enabled — Determines whether records are marked inactive (`isActive = false`) instead of being physically deleted.
- **Public Access:** No — If enabled, anonymous users may access this object’s data depending on route-level rules.
- **Tenant-Level Scope:** No — Enables data isolation per tenant by attaching a tenant ID field.

### Properties Schema

| Property          | Type    | Required | Description                                                                  |
| ----------------- | ------- | -------- | ---------------------------------------------------------------------------- |
| `reportRequestId` | ID      | Yes      | Reference to the reportRequest for which this file was generated.            |
| `fileUrl`         | String  | Yes      | Storage URL (internal/public) of the report file.                            |
| `format`          | Enum    | Yes      | Report file format: 0=pdf, 1=csv, 2=xlsx                                     |
| `signedUrl`       | String  | No       | Time-limited, signed download URL for the file, generated per access policy. |
| `signedUrlExpiry` | Date    | No       | The expiration time for the signed download URL.                             |
| `downloadCount`   | Integer | Yes      | How many times this report was downloaded (incremented for auditing).        |

- Required properties are mandatory for creating objects and must be provided in the request body if no default value is set.

### Constant Properties

`reportRequestId` `fileUrl` `format`

Constant properties are defined to be immutable after creation, meaning they cannot be updated or changed once set. They are typically used for properties that should remain constant throughout the object's lifecycle.
A property is set to be constant if the `Allow Update` option is set to `false`.

### Auto Update Properties

`reportRequestId` `fileUrl` `format` `signedUrl` `signedUrlExpiry` `downloadCount`

An update crud route created with the option `Auto Params` enabled will automatically update these properties with the provided values in the request body.
If you want to update any property in your own business logic not by user input, you can set the `Allow Auto Update` option to false.
These properties will be added to the update route's body parameters and can be updated by the user if any value is provided in the request body.

### Enum Properties

Enum properties are defined with a set of allowed values, ensuring that only valid options can be assigned to them.
The enum options value will be stored as strings in the database,
but when a data object is created an addtional property with the same name plus an idx suffix will be created, which will hold the index of the selected enum option.
You can use the index property to sort by the enum value or when your enum options represent a sequence of values.

- **format**: [pdf, csv, xlsx]

### Elastic Search Indexing

`reportRequestId`

Properties that are indexed in Elastic Search will be searchable via the Elastic Search API.
While all properties are stored in the elastic search index of the data object, only those marked for Elastic Search indexing will be available for search queries.

### Database Indexing

`reportRequestId`

Properties that are indexed in the database will be optimized for query performance, allowing for faster data retrieval.
Make a property indexed in the database if you want to use it frequently in query filters or sorting.

### Relation Properties

`reportRequestId`

Mindbricks supports relations between data objects, allowing you to define how objects are linked together.
You can define relations in the data object properties, which will be used to create foreign key constraints in the database.
For complex joins operations, Mindbricks supportsa BFF pattern, where you can view dynamic and static views based on Elastic Search Indexes.
Use db level relations for simple one-to-one or one-to-many relationships, and use BFF views for complex joins that require multiple data objects to be joined together.

- **reportRequestId**: ID
  Relation to `reportRequest`.id

The target object is a parent object, meaning that the relation is a one-to-many relationship from target to this object.

On Delete: Set Null
Required: Yes

### Filter Properties

`reportRequestId` `format` `downloadCount`

Filter properties are used to define parameters that can be used in query filters, allowing for dynamic data retrieval based on user input or predefined criteria.
These properties are automatically mapped as route parameters in the listing CRUD routes that have "Auto Params" enabled.

- **reportRequestId**: ID has a filter named `reportRequestId`

- **format**: Enum has a filter named `format`

- **downloadCount**: Integer has a filter named `downloadCount`
