const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getOpenApiSchemaAggById module", () => {
  let sandbox;
  let getOpenApiSchemaAggById;
  let OpenApiSchemaStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test OpenApiSchema" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    OpenApiSchemaStub = {
      findOne: sandbox.stub().resolves({ getData: () => fakeData }),
      findAll: sandbox
        .stub()
        .resolves([
          { getData: () => ({ id: "1", name: "Item 1" }) },
          { getData: () => ({ id: "2", name: "Item 2" }) },
        ]),
      getCqrsJoins: sandbox.stub().resolves(),
    };

    getOpenApiSchemaAggById = proxyquire(
      "../../../../../src/db-layer/main/OpenApiSchema/utils/getOpenApiSchemaAggById",
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
        },
        sequelize: { Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getOpenApiSchemaAggById", () => {
    it("should return getData() with includes for single ID", async () => {
      const result = await getOpenApiSchemaAggById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(OpenApiSchemaStub.findOne);
      sinon.assert.calledOnce(OpenApiSchemaStub.getCqrsJoins);
    });

    it("should return mapped getData() for array of IDs", async () => {
      const result = await getOpenApiSchemaAggById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(OpenApiSchemaStub.findAll);
      sinon.assert.calledOnce(OpenApiSchemaStub.getCqrsJoins);
    });

    it("should return null if not found for single ID", async () => {
      OpenApiSchemaStub.findOne.resolves(null);
      const result = await getOpenApiSchemaAggById(fakeId);
      expect(result).to.equal(null);
    });

    it("should return empty array if input is array but no results", async () => {
      OpenApiSchemaStub.findAll.resolves([]);
      const result = await getOpenApiSchemaAggById(["nope"]);
      expect(result).to.deep.equal([]);
    });

    it("should return undefined if getData returns undefined in array items", async () => {
      OpenApiSchemaStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getOpenApiSchemaAggById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });

    it("should return undefined if getData returns undefined in single ID", async () => {
      OpenApiSchemaStub.findOne.resolves({ getData: () => undefined });
      const result = await getOpenApiSchemaAggById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should throw HttpServerError on unexpected error (findOne)", async () => {
      OpenApiSchemaStub.findOne.rejects(new Error("fail"));
      try {
        await getOpenApiSchemaAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingOpenApiSchemaAggById",
        );
        expect(err.details.message).to.equal("fail");
      }
    });

    it("should throw HttpServerError on unexpected error (findAll)", async () => {
      OpenApiSchemaStub.findAll.rejects(new Error("all fail"));
      try {
        await getOpenApiSchemaAggById(["1"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingOpenApiSchemaAggById",
        );
        expect(err.details.message).to.equal("all fail");
      }
    });

    it("should throw HttpServerError if getCqrsJoins fails", async () => {
      OpenApiSchemaStub.getCqrsJoins.rejects(new Error("joins fail"));
      try {
        await getOpenApiSchemaAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingOpenApiSchemaAggById",
        );
        expect(err.details.message).to.equal("joins fail");
      }
    });
  });
});
