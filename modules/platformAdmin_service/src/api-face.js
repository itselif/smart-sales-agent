const { inject } = require("mindbricks-api-face");

module.exports = (app) => {
  const authUrl = (process.env.SERVICE_URL ?? "mindbricks.com").replace(
    process.env.SERVICE_SHORT_NAME,
    "auth",
  );

  const config = {
    name: "salesai - platformAdmin",
    brand: {
      name: "salesai",
      image: "https://mindbricks.com/favicon.ico",
      moduleName: "platformAdmin",
      version: process.env.SERVICE_VERSION || "1.0.0",
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
        name: "OpenApiSchema",
        description:
          "Stores current and historical OpenAPI schema definitions for all APIs, including versioning and description metadata.",
        reference: {
          tableName: "openApiSchema",
          properties: [
            {
              name: "version",
              type: "String",
            },

            {
              name: "description",
              type: "Text",
            },

            {
              name: "schemaJson",
              type: "Text",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "GET",
            url: "/openapischemas/{openApiSchemaId}",
            title: "getOpenApiSchema",
            query: [],

            parameters: [
              {
                key: "openApiSchemaId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "POST",
            url: "/openapischemas",
            title: "createOpenApiSchema",
            query: [],

            body: {
              type: "json",
              content: {
                version: "String",
                description: "Text",
                schemaJson: "Text",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: "/openapischemas/{openApiSchemaId}",
            title: "updateOpenApiSchema",
            query: [],

            body: {
              type: "json",
              content: {
                description: "Text",
                schemaJson: "Text",
              },
            },

            parameters: [
              {
                key: "openApiSchemaId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "DELETE",
            url: "/openapischemas/{openApiSchemaId}",
            title: "deleteOpenApiSchema",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "openApiSchemaId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: "/openapischemas",
            title: "listOpenApiSchemas",
            query: [],

            parameters: [],
            headers: [],
          },
        ],
      },
    ],
  };

  inject(app, config);
};
