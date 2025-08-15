# Service Design Specification

**BFF Service Documentation**
**Version:** `1.0`

---

## Scope

This document provides a comprehensive architectural overview of the **BFF Service**, a Backend-for-Frontend layer designed to unify access to backend ElasticSearch indices and event-driven aggregation logic. The service offers a full REST API suite and listens to Kafka topics to synchronize enriched views.

This document is intended for:

* **Architects** ensuring integration patterns and event consistency.
* **Developers** building on top of or consuming the BFF service.
* **DevOps Engineers** responsible for deployment and environment setup.

> For endpoint-level specifications, refer to the REST API Guide.
> For listener-level behavior, refer to the Event API Guide.

---

## Service Settings

* **Port**: Configurable via `HTTP_PORT`, default: `3000`
* **ElasticSearch**: Primary storage and query engine
* **Kafka Broker**: `KAFKA_BROKER` for aggregation sync
* **Mindbricks Injected Interface**: Configured with `api-face`
* **Dynamic REST Routes**: Powered via codegen with `/<indexName>` structure

---

## API Routes Overview

The BFF service exposes a dynamic REST API interface that provides full access to ElasticSearch indices. These include list, count, filter, and schema-based interactions for both stored and virtual views.

For full documentation of REST routes, including supported methods and examples, refer to the **REST API Guide**.

---

## Kafka Event Listeners

The BFF service listens to ElasticSearch-related Kafka topics to maintain enriched and denormalized indices. These listeners trigger view aggregation functions upon receiving `create`, `update`, or `delete` events for primary and related entities.

For detailed behavior, payloads, and listener-to-function mappings, refer to the **Event Guide**.

---

## Aggregation Strategy

Each view is either:

* **Stored View**: materialized into a separate ElasticSearch index
* **Virtual View**: dynamically aggregated on request

For each stored view:

* `viewNameAggregateData(id)` handles source rehydration
* Aggregates are executed via `aggregateNameAggregateDataFromIndex()`
* Lookups via `lookupNameLookupDataFromIndex()`
* Stats via `statNameStatDataFromIndex()`

Final document is saved to: `<project_codename>_<view.newIndexName>`

---

## Middleware

### Error Handling

* `ApiError` extends native error
* `errorConverter` ensures consistent error format
* `errorHandler` outputs error JSON with stack trace in development

### Request Validation

* `validate()` uses Joi + custom schema per route
* Filters and pagination are schema-validated
* Filter operators supported: `eq`, `noteq`, `range`, `wildcard`, `match`, etc.

### Async Wrapper

* `catchAsync(fn)` auto-handles exceptions in async route handlers

---

## Elasticsearch Utilities

* **Index Management**: create, check, delete
* **Document Operations**: get, create, update, delete
* **Query Builders**:

  * `queryBuilder()` for filters
  * `searchBuilder()` for full-text queries
  * `aggBuilder()` for terms aggregations
* **Multi-index search support** with `multiSearchBuilder()`
* **Dynamic Schema Extraction** via `fieldBuilder()`

---

## Cron Repair Logic

Runs periodically to ensure data integrity:

* `runAllRepair()` triggers each `viewNameRepair()`
* For each view:

  * Reads base index with `match_all`
  * Re-runs aggregation pipeline
  * Indexes final result into enriched view index

---

## Environment Variables

| Variable             | Description                        |
| -------------------- | ---------------------------------- |
| `HTTP_PORT`          | Service port                       |
| `KAFKA_BROKER`       | Kafka broker host                  |
| `ELASTIC_URL`        | Elasticsearch base URL             |
| `CORS_ORIGIN`        | Allowed frontend origin (optional) |
| `NODE_ENV`           | Environment (dev, prod)            |
| `SERVICE_URL`        | Used for injected API face config  |
| `SERVICE_SHORT_NAME` | Used in injected auth URL          |

---

## App Lifecycle

1. Loads env: `.env`, `.prod.env`, etc.
2. Bootstraps Express app with:

   * CORS setup
   * JSON + cookie parsers
   * Dynamic routes
   * Swagger and API Face
3. Starts:

   * Kafka listeners
   * Cron repair jobs
   * Full enrichment pipelines
4. Handles SIGINT to close server cleanly

---

## Testing Strategy

### Unit Tests

* Aggregation methods per view
* Joi schemas
* Custom middleware (errors, async, pick)

### Integration Tests

* REST APIs (mock Elastic)
* Kafka event triggers → view enrichment

### Load Tests (Optional)

* GET `/index/list` with filters
* Event storm on Kafka topics
* Cron job load verification

---