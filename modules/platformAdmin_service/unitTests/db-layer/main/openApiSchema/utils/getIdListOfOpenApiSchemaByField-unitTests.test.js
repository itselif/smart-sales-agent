const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getIdListOfOpenApiSchemaByField module", () => {
  let sandbox;
  let getIdListOfOpenApiSchemaByField;
  let OpenApiSchemaStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    OpenApiSchemaStub = {
      findAll: sandbox.stub().resolves([{ id: "1" }, { id: "2" }]),
      version: "example-type",
    };

    getIdListOfOpenApiSchemaByField = proxyquire(
      "../../../../../src/db-layer/main/OpenApiSchema/utils/getIdListOfOpenApiSchemaByField",
      {
        models: { OpenApiSchema: OpenApiSchemaStub },
        common: {
          HttpServerError: class HttpServerError extends Error {
            constructor(msg, details) {
              super(msg);
              this.name = "HttpServerError";
              this.details = details;
            }
          },
          BadRequestError: class BadRequestError extends Error {
            constructor(msg) {
              super(msg);
              this.name = "BadRequestError";
            }
          },
          NotFoundError: class NotFoundError extends Error {
            constructor(msg) {
              super(msg);
              this.name = "NotFoundError";
            }
          },
        },
        sequelize: { Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getIdListOfOpenApiSchemaByField", () => {
    it("should return list of IDs when valid field and value is given", async () => {
      OpenApiSchemaStub["version"] = "string";
      const result = await getIdListOfOpenApiSchemaByField(
        "version",
        "test-value",
        false,
      );
      expect(result).to.deep.equal(["1", "2"]);
      sinon.assert.calledOnce(OpenApiSchemaStub.findAll);
    });

    it("should return list of IDs using Op.contains if isArray is true", async () => {
      OpenApiSchemaStub["version"] = "string";
      const result = await getIdListOfOpenApiSchemaByField(
        "version",
        "val",
        true,
      );
      const call = OpenApiSchemaStub.findAll.getCall(0);
      expect(call.args[0].where["version"][Op.contains]).to.include("val");
    });

    it("should throw BadRequestError if field name is invalid", async () => {
      try {
        await getIdListOfOpenApiSchemaByField("nonexistentField", "x", false);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field name");
      }
    });

    it("should throw BadRequestError if field value has wrong type", async () => {
      OpenApiSchemaStub["version"] = 123; // expects number

      try {
        await getIdListOfOpenApiSchemaByField("version", "wrong-type", false);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field value type");
      }
    });

    it("should throw NotFoundError if no records are found", async () => {
      OpenApiSchemaStub.findAll.resolves([]);
      OpenApiSchemaStub["version"] = "string";

      try {
        await getIdListOfOpenApiSchemaByField("version", "nomatch", false);
        throw new Error("Expected NotFoundError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("NotFoundError");
        expect(err.details.message).to.include(
          "OpenApiSchema with the specified criteria not found",
        );
      }
    });

    it("should wrap findAll error in HttpServerError", async () => {
      OpenApiSchemaStub.findAll.rejects(new Error("query failed"));
      OpenApiSchemaStub["version"] = "string";

      try {
        await getIdListOfOpenApiSchemaByField("version", "test", false);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.message).to.equal("query failed");
      }
    });
  });
});
