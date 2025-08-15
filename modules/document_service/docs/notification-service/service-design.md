# Service Design Specification

**Notification Service Documentation**
**Version:** `1.0`

---

## Scope

This document provides a comprehensive architectural overview of the **Notification Service**, which is responsible for sending multi-channel notifications via Email, SMS, and Push. The service supports both REST and gRPC interfaces and utilizes an event-driven architecture through Kafka.

This document is intended for:

* **Backend Developers** integrating notification capabilities.
* **DevOps Engineers** deploying or monitoring the notification system.
* **Architects** evaluating extensibility, observability, and scalability.

> For detailed REST interface, refer to the \[REST API Guide].
> For Kafka-based publishing and consumption flows, refer to the \[Event API Guide].

---

## Service Settings

* **Port**: Configurable via `HTTP_PORT`, default: `3000`
* **Primary Interfaces**:

  * REST over Express
  * gRPC over Proto3
  * Kafka via event topics
* **Database**: PostgreSQL (via Sequelize)
* **Optional**: Redis (for caching or state sharing)
* **Email/SMS/Push Provider Configuration**: Dynamically switchable via `.env`

---

## Interfaces Overview

### REST API

Exposes endpoints to:

* Register/unregister devices
* Fetch user notifications
* Send new notifications
* Mark notifications as seen

For full list and parameters, refer to the **REST API Guide**.

### gRPC API

Defined via `notification.sender.proto`:

* `SendNotice()` RPC triggers notification dispatch for all specified channels.
* Used for inter-service communication where synchronous flow is preferred.

### Kafka Events

* The service **publishes** to and **subscribes** from:

  * `<codename>-notification-email`
  * `<codename>-notification-push`
  * `<codename>-notification-sms`

For event structure and consumption logic, refer to the **Event API Guide**.

---

## Provider Architecture

Each channel (SMS, Email, Push) is pluggable using a provider pattern. Providers can be toggled via env vars.

### Email Providers

* SendGrid
* SMTP
* AmazonSES
* FakeProvider (for dev/test)

### Push Providers

* Firebase (FCM)
* OneSignal
* AmazonSNS
* FakeProvider

### SMS Providers

* Twilio
* AmazonSNS
* NetGSM
* Vonage
* FakeProvider

Each provider implements a common `send(payload)` method and logs delivery result.

---

## Storage Mode

Notifications can be optionally stored in the PostgreSQL database if `STORED_NOTICE=true` and `notificationBody.isStored=true`.

Stored data includes:

* `userId`, `title`, `body`
* `metadata` (JSON)
* `isSeen` flag
* `createdAt` / `updatedAt` timestamps

---

## Aggregation & Templating

Notification body and title can be:

* Directly passed as raw strings
* Or dynamically populated via predefined templates:

  * `WELCOME`
  * `OTP`
  * `RESETPASSWORD`
  * `NONE` (no template)

Template rendering supports interpolation with `metadata`.
Separate template files exist for:

* Email (HTML)
* SMS (Text)
* Push (structured JSON)

---

## Middleware

### Error Handling

* `ApiError` used for standard error shaping
* `errorConverter`, `errorHandler` used globally

### Validation

* All routes use Joi schema validation
* Validations available for:

  * Device registration
  * Notification send
  * Pagination and sort filters
  * Mark-as-seen by IDs

### Utilities

* `pick()`: Selects allowed keys from request
* `pagination()`: Sequelize-based paginated query utility

---

## Lifecycle & Boot Process

1. Loads configuration from `.env` using `dotenv`
2. Initializes:

   * Express HTTP Server
   * gRPC Server (if `GRPC_ACTIVE=true`)
   * Kafka listeners
   * Redis connection
   * PostgreSQL connection
3. Injects OpenAPI/Swagger via `api-face`
4. Registers REST routes and middleware
5. Launches any scheduled cron jobs
6. Handles graceful shutdown via `SIGINT`

---

## Environment Variables

| Variable               | Description                         |
| ---------------------- | ----------------------------------- |
| `HTTP_PORT`            | Express HTTP port (default: 3000)   |
| `GRPC_PORT`            | gRPC server port (default: 50051)   |
| `SERVICE_URL`          | Used to build auth redirect paths   |
| `SERVICE_SHORT_NAME`   | Used for auth hostname substitution |
| `PG_USER`, `PG_PASS`   | PostgreSQL credentials              |
| `REDIS_HOST`           | Redis connection string             |
| `STORED_NOTICE`        | Whether to persist notifications    |
| `SENDGRID_API_KEY`     | SendGrid API token                  |
| `SMTP_USER/PASS/PORT`  | SMTP credentials                    |
| `TWILIO_*`, `NETGSM_*` | SMS provider credentials            |
| `ONESIGNAL_API_KEY`    | OneSignal Push key                  |

---

## Testing Strategy

### Unit Tests

* Provider `.send()` methods
* Templating with metadata
* Validation schema boundaries

### Integration Tests

* REST endpoint workflows
* Kafka → Listener execution
* gRPC request handling

### End-to-End (Optional)

* Simulate a full pipeline: Send → Store → Fetch → Mark as Seen

---

## Observability & Logging

* Each send call logs payload & result to console
* Provider-specific errors include stack traces