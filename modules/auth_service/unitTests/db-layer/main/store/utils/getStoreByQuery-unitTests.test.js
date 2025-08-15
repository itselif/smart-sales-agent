const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getStoreByQuery module", () => {
  let sandbox;
  let getStoreByQuery;
  let StoreStub;

  const fakeId = "uuid-123";
  const fakeRecord = {
    id: fakeId,
    name: "Test Store",
    getData: () => ({ id: fakeId, name: "Test Store" }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    StoreStub = {
      findOne: sandbox.stub().resolves(fakeRecord),
    };

    getStoreByQuery = proxyquire(
      "../../../../../src/db-layer/main/Store/utils/getStoreByQuery",
      {
        models: { Store: StoreStub },
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

  describe("getStoreByQuery", () => {
    it("should return the result of getData if found", async () => {
      const result = await getStoreByQuery({ id: fakeId });

      expect(result).to.deep.equal({ id: fakeId, name: "Test Store" });
      sinon.assert.calledOnce(StoreStub.findOne);
      sinon.assert.calledWith(StoreStub.findOne, {
        where: {
          id: fakeId,
          isActive: true,
        },
      });
    });

    it("should return null if no record is found", async () => {
      StoreStub.findOne.resolves(null);

      const result = await getStoreByQuery({ id: fakeId });

      expect(result).to.be.null;
      sinon.assert.calledOnce(StoreStub.findOne);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await getStoreByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await getStoreByQuery("invalid-query");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should wrap findOne errors in HttpServerError", async () => {
      StoreStub.findOne.rejects(new Error("findOne failed"));

      try {
        await getStoreByQuery({ test: true });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingStoreByQuery",
        );
        expect(err.details.message).to.equal("findOne failed");
      }
    });

    it("should return undefined if getData returns undefined", async () => {
      StoreStub.findOne.resolves({ getData: () => undefined });

      const result = await getStoreByQuery({ id: fakeId });

      expect(result).to.be.undefined;
    });
  });
});
