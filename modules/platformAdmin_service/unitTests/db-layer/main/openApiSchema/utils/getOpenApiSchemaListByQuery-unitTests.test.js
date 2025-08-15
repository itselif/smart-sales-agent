const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getOpenApiSchemaListByQuery module", () => {
  let sandbox;
  let getOpenApiSchemaListByQuery;
  let OpenApiSchemaStub;

  const fakeList = [
    { getData: () => ({ id: "1", name: "Item 1" }) },
    { getData: () => ({ id: "2", name: "Item 2" }) },
  ];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    OpenApiSchemaStub = {
      findAll: sandbox.stub().resolves(fakeList),
    };

    getOpenApiSchemaListByQuery = proxyquire(
      "../../../../../src/db-layer/main/OpenApiSchema/utils/getOpenApiSchemaListByQuery",
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

  describe("getOpenApiSchemaListByQuery", () => {
    it("should return list of getData() results if query is valid", async () => {
      const result = await getOpenApiSchemaListByQuery({ isActive: true });

      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);

      sinon.assert.calledOnce(OpenApiSchemaStub.findAll);
      sinon.assert.calledWithMatch(OpenApiSchemaStub.findAll, {
        where: { isActive: true },
      });
    });

    it("should return [] if findAll returns null", async () => {
      OpenApiSchemaStub.findAll.resolves(null);

      const result = await getOpenApiSchemaListByQuery({ active: false });
      expect(result).to.deep.equal([]);
    });

    it("should return [] if findAll returns empty array", async () => {
      OpenApiSchemaStub.findAll.resolves([]);

      const result = await getOpenApiSchemaListByQuery({ clientId: "xyz" });
      expect(result).to.deep.equal([]);
    });

    it("should return list of undefineds if getData() returns undefined", async () => {
      OpenApiSchemaStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);

      const result = await getOpenApiSchemaListByQuery({ active: true });
      expect(result).to.deep.equal([undefined, undefined]);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await getOpenApiSchemaListByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await getOpenApiSchemaListByQuery("not-an-object");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw HttpServerError if findAll fails", async () => {
      OpenApiSchemaStub.findAll.rejects(new Error("findAll failed"));

      try {
        await getOpenApiSchemaListByQuery({ some: "query" });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingOpenApiSchemaListByQuery",
        );
        expect(err.details.message).to.equal("findAll failed");
      }
    });
  });
});
