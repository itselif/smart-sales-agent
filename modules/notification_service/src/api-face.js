const { inject } = require("mindbricks-api-face");

module.exports = (app) => {
  const authUrl = (process.env.SERVICE_URL ?? "mindbricks.com").replace(
    process.env.SERVICE_SHORT_NAME,
    "auth",
  );
  inject(app, {
    name: "salesai - notification",
    brand: {
      name: "salesai",
      image: "https://mindbricks.com/favicon.ico",
      moduleName: "notification",
    },
    auth: {
      url: authUrl,
      loginPath: "/login",
      logoutPath: "/logout",
      currentUserPath: "/currentuser",
      authStrategy: "external",
      initialAuth: true,
    },
    dataObjects: [
      {
        name: "notification",
        description: "notification",
        reference: {
          tableName: "notification",
          properties: [
            {
              name: "id",
              type: "uuid",
            },
            {
              name: "userId",
              type: "uuid",
            },
            {
              name: "title",
              type: "string",
            },
            {
              name: "body",
              type: "string",
            },
            {
              name: "isSeen",
              type: "boolean",
            },
            {
              name: "metadata",
              type: "json",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "GET",
            url: "/notifications",
            title: "Get Notifications",
            query: [
              {
                key: "sortBy",
                value: "createdAt",
                description: "Sort by",
                active: true,
              },
              {
                key: "page",
                value: "1",
                description: "Page number",
                active: true,
              },
              {
                key: "limit",
                value: "10",
                description: "Limit number",
                active: true,
              },
            ],
            body: {},
            parameters: [],
            headers: [],
          },
          {
            isAuth: true,
            method: "POST",
            url: "/notifications",
            title: "Send Notification",
            query: [],
            body: {
              type: "json",
              content: {
                types: ["email"],
                template: "NONE",
                userId: "uuid",
                email: "test@test.com",
                phoneNumber: "",
                title: "Test Title",
                body: "Test Body",
                isStored: true,
                metadata: {},
              },
            },
            parameters: [],
            headers: [],
          },
          {
            isAuth: true,
            method: "POST",
            url: "/notifications/seen",
            title: "Seen Notification",
            query: [],
            body: {
              type: "json",
              content: {
                notificationIds: ["uuid"],
              },
            },
            parameters: [],
            headers: [],
          },
        ],
      },
      {
        name: "deviceToken",
        description: "deviceToken",
        reference: {
          tableName: "deviceToken",
          properties: [
            {
              name: "id",
              type: "uuid",
            },
            {
              name: "userId",
              type: "uuid",
            },
            {
              name: "deviceId",
              type: "string",
            },
            {
              name: "notificationToken",
              type: "string",
            },
            {
              name: "os",
              type: "enum(IOS, ANDROID, WEB)",
            },
            {
              name: "osVersion",
              type: "string",
            },
            {
              name: "osModel",
              type: "string",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "POST",
            url: "/devices/register",
            title: "Register Device",
            query: [],
            body: {
              type: "json",
              content: {
                deviceId: "string",
                notificationToken: "string",
                os: "enum(IOS, ANDROID, WEB)",
                osVersion: "string",
                osModel: "string",
              },
            },
            parameters: [],
            headers: [],
          },
          {
            isAuth: true,
            method: "DELETE",
            url: "/devices/unregister/{deviceId}",
            title: "Unregister Device",
            query: [],
            parameters: [
              {
                key: "deviceId",
                value: "string",
                description: "Device ID",
                active: true,
              },
            ],
            body: {},
            headers: [],
          },
        ],
      },
    ],
  });
};
