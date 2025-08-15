# salesai-notification-service

## Overview

The notification service allows sending notifications through SMS, Email, and Push channels. Providers can be configured dynamically through the `.env` file.

## Environment Variables

### Service

```env
# Service
SERVICE_PORT=3000
GRPC_PORT=50051
STORED_NOTICE=true
```

`STORED_NOTICE` determines whether notifications are saved to the database. If set to `true`, notifications are stored on a per-user basis and can be listed.

### Database

```env
# Database
DB_NAME=hexa-notification
DB_USER=postgres
DB_PASS=123456
DB_HOST=localhost
DB_PORT=5432
DB_DIALECT=postgres
```

### Kafka

```env
# Kafka
KAFKA_CLIENT_ID=notification-service
KAFKA_BOOTSTRAP_SERVER=localhost:9092
```

### Providers

```env
# Providers
SMS_PROVIDER=netgsm
EMAIL_PROVIDER=smtp
PUSH_PROVIDER=firebase
```

For development environments, providers can be set to `fake` to avoid errors:

```env
# Providers
SMS_PROVIDER=fake
EMAIL_PROVIDER=fake
PUSH_PROVIDER=fake
```

When set to `fake`, no actual notifications are sent, but the system behaves as if the notifications were delivered successfully. No additional configuration is needed for the fake providers.

### SMS Providers

#### NetGSM

```env
# Netgsm
NETGSM_USER=test
NETGSM_PASS=test
NETGSM_SENDER=test
```

#### Amazon SNS

```env
# AmazonSns
AWS_ACCESS_KEY
AWS_SECRET_KEY
AWS_REGION
```

#### Twilio

```env
#Twillo
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_SENDER
```

#### Vonage

```env
#Vonage
VONAGE_TOKEN
VONAGE_SENDER
```

### Email Providers

#### Amazon SNS

```env
# AmazonSns
AWS_ACCESS_KEY
AWS_SECRET_KEY
AWS_REGION
```

#### SendGrid

```env
#SendGrid
SENDGRID_API_KEY
SENDGRID_FROM_EMAIL
```

#### SMTP

```env
# Smtp
SMTP_HOST=smtp.test.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=test@test.com
SMTP_PASS=test
SMTP_FROM_EMAIL=test@test.com
```

### Push Notification Providers

#### Firebase

```env
# Firebase
FIREBASE_KEY=testkey
```

#### Amazon SNS

```env
# AmazonSns
AWS_ACCESS_KEY
AWS_SECRET_KEY
AWS_REGION
```

#### OneSignal

```env
# OneSignal
ONESIGNAL_API_KEY
ONESIGNAL_APP_ID
```

## Request Validation

Incoming requests to the service must adhere to the following validation schema:

| Field         | Type           | Description                                                                         |
| ------------- | -------------- | ----------------------------------------------------------------------------------- |
| `types`       | Array          | Required. Must include one or more of the following values: `SMS`, `EMAIL`, `PUSH`. |
| `template`    | String         | Required. Must be one of: `NONE`, `WELCOME`, `RESETPASSWORD`, `OTP`.                |
| `userId`      | String (GUID)  | Required. A valid GUID identifying the user.                                        |
| `email`       | String (Email) | Required if `types` includes `EMAIL`. Must be a valid email address.                |
| `phoneNumber` | String         | Required if `types` includes `SMS`.                                                 |
| `title`       | String         | Required. Title of the notification.                                                |
| `body`        | String         | Optional. Body of the notification.                                                 |
| `isStored`    | Boolean        | Required. Indicates whether the notification should be stored.                      |
| `metadata`    | Object         | Optional. Additional metadata related to the notification.                          |

### Workflow

1. Requests can be made via REST API or gRPC.
2. For each type (`SMS`, `EMAIL`, `PUSH`), data is prepared individually.
3. If a template is specified, EJS is used to render the content into HTML or plain text.
4. Events are sent to Kafka topics:
   - Email: `hexa-notification-email`
   - SMS: `hexa-notification-sms`
   - Push: `hexa-notification-push`
5. Consumers listen to these topics and handle the actual delivery of notifications.

## Adding Custom Providers

To add a custom provider, follow these steps:

### Folder Structure

Under the `providers` directory, there are three main folders:

- `email`
- `sms`
- `push`

Each folder contains JavaScript files named `{providerName}.provider.js` for individual providers. For example, the `netgsm` SMS provider is implemented as `providers/sms/netgsm.provider.js`.

### Example: NetGSM Provider

```javascript
const axios = require("axios");
class NetGSMProvider {
  constructor() {
    super();
    this.name = "NetGSM";
    this.axios = axios.create({
      baseURL: "https://api.netgsm.com.tr/sms/send",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }
  async send(payload) {
    console.log("NetGSM ile SMS gönderiliyor:", payload);
    try {
      await this.axios.post("/", this.mapToData(payload));
      return { success: true, provider: this.name };
    } catch (error) {
      console.error("NetGSM ile SMS gönderilirken hata oluştu:", error);
      return { success: false, provider: this.name };
    }
  }

  mapToData(payload) {
    return {
      username: process.env.NETGSM_USER,
      password: process.env.NETGSM_PASS,
      source_addr: process.env.NETGSM_SENDER,
      target_addr: payload.to,
      message: payload.message,
      msg_type: "text",
      encoding: "utf-8",
      request_mode: 1,
      valid_until: "",
      send_date: "",
    };
  }
}

module.exports = NetGSMProvider;
```

### Adding a New SMS Provider (e.g., XSms)

1. Create a new file `xsms.provider.js` in the `providers/sms/` directory.

Example:

```javascript
class XSmsProvider {
  constructor() {
    super();
    this.name = "XSms";
    // Add XSms provider-specific configurations
  }
  async send(payload) {
    console.log("XSMS ile SMS gönderiliyor:", payload);
    try {
      // Add send logic
      return { success: true, provider: this.name };
    } catch (error) {
      console.error("XSMS ile SMS gönderilirken hata oluştu:", error);
      return { success: false, provider: this.name };
    }
  }

  mapToData(payload) {
    // Map payload to XSms provider's data structure
    return {
      // Add mapping logic
    };
  }
}

module.exports = XSmsProvider;
```

2. Update the `.env` file to set the SMS provider:

```env
SMS_PROVIDER=xsms
```

The new provider will be loaded dynamically.
