# EVENT API GUIDE

## NOTIFICATION SERVICE

The Notification service is a microservice that allows sending notifications through SMS, Email, and Push channels. Providers can be configured dynamically through the `.env` file.

## Architectural Design Credit and Contact Information

The architectural design of this microservice is credited to.  
For inquiries, feedback, or further information regarding the architecture, please direct your communication to:

**Email**:

We encourage open communication and welcome any questions or discussions related to the architectural aspects of this microservice.

## Documentation Scope

Welcome to the official documentation for the Notification Service Event Publishers and Listeners. This document provides a comprehensive overview of the event-driven architecture employed in the Notification Service, detailing the various events that are published and consumed within the system.

**Intended Audience**  
This documentation is intended for developers, architects, and system administrators involved in the design, implementation, and maintenance of the Notification Service. It assumes familiarity with microservices architecture and the Kafka messaging system.

**Overview**  
This document outlines the key components of the Notification Service's event-driven architecture, including the events that are published and consumed, the Kafka topics used, and the expected payloads for each event. It serves as a reference guide for understanding how events flow through the system and how different components interact with each other.

## Kafka Event Publishers

### Kafka Event Publisher: sendEmailNotification

**Event Topic**: `salesai1-notification-service-notification-email`

When a notification is sent through the Email channel, this publisher is responsible for sending the notification to the Kafka topic `salesai1-notification-service-notification-email`. The payload of the event includes the necessary information for sending the email, such as recipient details, subject, and message body.

### Kafka Event Publisher: sendPushNotification

**Event Topic**: `salesai1-notification-service-notification-push`

When a notification is sent through the Push channel, this publisher is responsible for sending the notification to the Kafka topic `salesai1-notification-service-notification-push`. The payload of the event includes the necessary information for sending the push notification, such as recipient details, title, and message body.

### Kafka Event Publisher: sendSmsNotification

**Event Topic**: salesai1-notification-service-notification-sms`

When a notification is sent through the SMS channel, this publisher is responsible for sending the notification to the Kafka topic `salesai1-notification-service-notification-sms`. The payload of the event includes the necessary information for sending the SMS, such as recipient details and message body.

## Kafka Event Listeners

### Kafka Event Listener: runEmailSenderListener

**Event Topic**: `salesai1-notification-service-notification-email`

When a notification is sent through the Email channel, this listener is triggered. It consumes messages from the `salesai1-notification-service-notification-email` topic, parses the payload, and uses the dynamically configured email provider to send the notification.

### Kafka Event Listener: runPushSenderListener

**Event Topic**: `salesai1-notification-service-notification-push`

When a notification is sent through the Push channel, this listener is triggered. It consumes messages from the `salesai1-notification-service-notification-push` topic, parses the payload, and uses the dynamically configured push provider to send the notification.

### Kafka Event Listener: runSmsSenderListener

**Event Topic**: `salesai1-notification-service-notification-sms`

When a notification is sent through the SMS channel, this listener is triggered. It consumes messages from the `salesai1-notification-service-notification-sms` topic, parses the payload, and uses the dynamically configured SMS provider to send the notification.

### Kafka Event Listener: runaccountRegistrationConfirmationListener

**Event Topic**: `storeManagement.storeAssignment.created`

When a notification is sent through the `storeManagement.storeAssignment.created` topic, this listener is triggered. It processes the message, extracts required metadata, and constructs a notification payload using a predefined template (`[object Object]`).

It supports condition-based filtering and optionally enriches the payload by retrieving data from ElasticSearch if the `dataView` source is used (`userRegistrationConfirmationView`).

The notification is sent to the target(s) identified in the payload or in the retrieved data source using the Notification Service.

### Kafka Event Listener: runreportReadyForDownloadListener

**Event Topic**: `reporting.reportFile.created`

When a notification is sent through the `reporting.reportFile.created` topic, this listener is triggered. It processes the message, extracts required metadata, and constructs a notification payload using a predefined template (`[object Object]`).

It supports condition-based filtering and optionally enriches the payload by retrieving data from ElasticSearch if the `dataView` source is used (`reportReadyForDownloadView`).

The notification is sent to the target(s) identified in the payload or in the retrieved data source using the Notification Service.

### Kafka Event Listener: runlowStockAlertListener

**Event Topic**: `inventoryManagement.lowStockAlert.created`

When a notification is sent through the `inventoryManagement.lowStockAlert.created` topic, this listener is triggered. It processes the message, extracts required metadata, and constructs a notification payload using a predefined template (`[object Object]`).

It supports condition-based filtering and optionally enriches the payload by retrieving data from ElasticSearch if the `dataView` source is used (`lowStockAlertView`).

The notification is sent to the target(s) identified in the payload or in the retrieved data source using the Notification Service.

### Kafka Event Listener: runtransactionCorrectionAuditListener

**Event Topic**: `salesManagement.saleTransactionHistory.created`

When a notification is sent through the `salesManagement.saleTransactionHistory.created` topic, this listener is triggered. It processes the message, extracts required metadata, and constructs a notification payload using a predefined template (`[object Object]`).

It supports condition-based filtering and optionally enriches the payload by retrieving data from ElasticSearch if the `dataView` source is used (`saleTransactionCorrectionAuditView`).

The notification is sent to the target(s) identified in the payload or in the retrieved data source using the Notification Service.

### Kafka Event Listener: runsystemHealthIncidentListener

**Event Topic**: `observability.anomalyEvent.created`

When a notification is sent through the `observability.anomalyEvent.created` topic, this listener is triggered. It processes the message, extracts required metadata, and constructs a notification payload using a predefined template (`[object Object]`).

It supports condition-based filtering and optionally enriches the payload by retrieving data from ElasticSearch if the `dataView` source is used (`systemHealthIncidentView`).

The notification is sent to the target(s) identified in the payload or in the retrieved data source using the Notification Service.

### Kafka Event Listener: runstoreOverrideGrantedListener

**Event Topic**: `storeManagement.storeAssignment.updated`

When a notification is sent through the `storeManagement.storeAssignment.updated` topic, this listener is triggered. It processes the message, extracts required metadata, and constructs a notification payload using a predefined template (`[object Object]`).

It supports condition-based filtering and optionally enriches the payload by retrieving data from ElasticSearch if the `dataView` source is used (`storeOverrideGrantedView`).

The notification is sent to the target(s) identified in the payload or in the retrieved data source using the Notification Service.

### Kafka Event Listener: runadminCICDStatusListener

**Event Topic**: `platformAdmin.cicdJob.statusChanged`

When a notification is sent through the `platformAdmin.cicdJob.statusChanged` topic, this listener is triggered. It processes the message, extracts required metadata, and constructs a notification payload using a predefined template (`[object Object]`).

It supports condition-based filtering and optionally enriches the payload by retrieving data from ElasticSearch if the `dataView` source is used (``).

The notification is sent to the target(s) identified in the payload or in the retrieved data source using the Notification Service.

### Kafka Event Listener: runuserVerificationListener

**Event Topic**: `SalesAI-user-service-email-verification-start`

When a notification is sent through the `SalesAI-user-service-email-verification-start` topic, this listener is triggered. It processes the message, extracts required metadata, and constructs a notification payload using a predefined template (`[object Object]`).

It supports condition-based filtering and optionally enriches the payload by retrieving data from ElasticSearch if the `dataView` source is used (``).

The notification is sent to the target(s) identified in the payload or in the retrieved data source using the Notification Service.

### Kafka Event Listener: runuserResetPasswordListener

**Event Topic**: `SalesAI-user-service-password-reset-by-email-start`

When a notification is sent through the `SalesAI-user-service-password-reset-by-email-start` topic, this listener is triggered. It processes the message, extracts required metadata, and constructs a notification payload using a predefined template (`[object Object]`).

It supports condition-based filtering and optionally enriches the payload by retrieving data from ElasticSearch if the `dataView` source is used (``).

The notification is sent to the target(s) identified in the payload or in the retrieved data source using the Notification Service.



