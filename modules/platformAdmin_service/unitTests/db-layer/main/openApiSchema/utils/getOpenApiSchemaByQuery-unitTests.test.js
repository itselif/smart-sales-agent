const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getOpenApiSchemaByQuery module", () => {
  let sandbox;
  let getOpenApiSchemaByQuery;
  let OpenApiSchemaStub;

  const fakeId = "uuid-123";
  const fakeRecord = {
    id: fakeId,
    name: "Test OpenApiSchema",
    getData: () => ({ id: fakeId, name: "Test OpenApiSchema" }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    OpenApiSchemaStub = {
      findOne: sandbox.stub().resolves(fakeRecord),
    };

    getOpenApiSchemaByQuery = proxyquire(
      "../../../../../src/db-layer/main/OpenApiSchema/utils/getOpenApiSchemaByQuery",
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
        },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getOpenApiSchemaByQuery", () => {
    it("should return the result of getData if found", async () => {
      const result = await getOpenApiSchemaByQuery({ id: fakeId });

      expect(result).to.deep.equal({ id: fakeId, name: "Test OpenApiSchema" });
      sinon.assert.calledOnce(OpenApiSchemaStub.findOne);
      sinon.assert.calledWith(OpenApiSchemaStub.findOne, {
        where: {
          id: fakeId,
          isActive: true,
        },
      });
    });

    it("should return null if no record is found", async () => {
      OpenApiSchemaStub.findOne.resolves(null);

      const result = await getOpenApiSchemaByQuery({ id: fakeId });

      expect(result).to.be.null;
      sinon.assert.calledOnce(OpenApiSchemaStub.findOne);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await getOpenApiSchemaByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await getOpenApiSchemaByQuery("invalid-query");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should wrap findOne errors in HttpServerError", async () => {
      OpenApiSchemaStub.findOne.rejects(new Error("findOne failed"));

      try {
        await getOpenApiSchemaByQuery({ test: true });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingOpenApiSchemaByQuery",
        );
        expect(err.details.message).to.equal("findOne failed");
      }
    });

    it("should return undefined if getData returns undefined", async () => {
      OpenApiSchemaStub.findOne.resolves({ getData: () => undefined });

      const result = await getOpenApiSchemaByQuery({ id: fakeId });

      expect(result).to.be.undefined;
    });
  });
});
