const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getOpenApiSchemaById module", () => {
  let sandbox;
  let getOpenApiSchemaById;
  let OpenApiSchemaStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test OpenApiSchema" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    OpenApiSchemaStub = {
      findOne: sandbox.stub().resolves({
        getData: () => fakeData,
      }),
      findAll: sandbox
        .stub()
        .resolves([
          { getData: () => ({ id: "1", name: "Item 1" }) },
          { getData: () => ({ id: "2", name: "Item 2" }) },
        ]),
    };

    getOpenApiSchemaById = proxyquire(
      "../../../../../src/db-layer/main/OpenApiSchema/utils/getOpenApiSchemaById",
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

  describe("getOpenApiSchemaById", () => {
    it("should return getData() for single ID", async () => {
      const result = await getOpenApiSchemaById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(OpenApiSchemaStub.findOne);
      sinon.assert.calledWith(
        OpenApiSchemaStub.findOne,
        sinon.match.has("where", sinon.match.has("id", fakeId)),
      );
    });

    it("should return mapped getData() results for array of IDs", async () => {
      const result = await getOpenApiSchemaById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(OpenApiSchemaStub.findAll);
      sinon.assert.calledWithMatch(OpenApiSchemaStub.findAll, {
        where: { id: { [Op.in]: ["1", "2"] } },
      });
    });

    it("should return null if record not found (single ID)", async () => {
      OpenApiSchemaStub.findOne.resolves(null);
      const result = await getOpenApiSchemaById(fakeId);
      expect(result).to.be.null;
    });

    it("should return null if empty array returned from findAll", async () => {
      OpenApiSchemaStub.findAll.resolves([]);
      const result = await getOpenApiSchemaById(["a", "b"]);
      expect(result).to.deep.equal([]);
    });

    it("should wrap unexpected errors with HttpServerError (single ID)", async () => {
      OpenApiSchemaStub.findOne.rejects(new Error("DB failure"));
      try {
        await getOpenApiSchemaById("test");
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingOpenApiSchemaById",
        );
        expect(err.details.message).to.equal("DB failure");
      }
    });

    it("should wrap unexpected errors with HttpServerError (array of IDs)", async () => {
      OpenApiSchemaStub.findAll.rejects(new Error("array failure"));
      try {
        await getOpenApiSchemaById(["fail"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingOpenApiSchemaById",
        );
        expect(err.details.message).to.equal("array failure");
      }
    });

    it("should return undefined if getData() returns undefined", async () => {
      OpenApiSchemaStub.findOne.resolves({ getData: () => undefined });
      const result = await getOpenApiSchemaById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should return array of undefineds if getData() returns undefined per item", async () => {
      OpenApiSchemaStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getOpenApiSchemaById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });
  });
});
