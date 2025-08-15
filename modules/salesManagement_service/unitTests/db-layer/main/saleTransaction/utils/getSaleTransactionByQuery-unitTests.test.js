const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getSaleTransactionByQuery module", () => {
  let sandbox;
  let getSaleTransactionByQuery;
  let SaleTransactionStub;

  const fakeId = "uuid-123";
  const fakeRecord = {
    id: fakeId,
    name: "Test SaleTransaction",
    getData: () => ({ id: fakeId, name: "Test SaleTransaction" }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    SaleTransactionStub = {
      findOne: sandbox.stub().resolves(fakeRecord),
    };

    getSaleTransactionByQuery = proxyquire(
      "../../../../../src/db-layer/main/SaleTransaction/utils/getSaleTransactionByQuery",
      {
        models: { SaleTransaction: SaleTransactionStub },
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

  describe("getSaleTransactionByQuery", () => {
    it("should return the result of getData if found", async () => {
      const result = await getSaleTransactionByQuery({ id: fakeId });

      expect(result).to.deep.equal({
        id: fakeId,
        name: "Test SaleTransaction",
      });
      sinon.assert.calledOnce(SaleTransactionStub.findOne);
      sinon.assert.calledWith(SaleTransactionStub.findOne, {
        where: {
          id: fakeId,
          isActive: true,
        },
      });
    });

    it("should return null if no record is found", async () => {
      SaleTransactionStub.findOne.resolves(null);

      const result = await getSaleTransactionByQuery({ id: fakeId });

      expect(result).to.be.null;
      sinon.assert.calledOnce(SaleTransactionStub.findOne);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await getSaleTransactionByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await getSaleTransactionByQuery("invalid-query");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should wrap findOne errors in HttpServerError", async () => {
      SaleTransactionStub.findOne.rejects(new Error("findOne failed"));

      try {
        await getSaleTransactionByQuery({ test: true });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingSaleTransactionByQuery",
        );
        expect(err.details.message).to.equal("findOne failed");
      }
    });

    it("should return undefined if getData returns undefined", async () => {
      SaleTransactionStub.findOne.resolves({ getData: () => undefined });

      const result = await getSaleTransactionByQuery({ id: fakeId });

      expect(result).to.be.undefined;
    });
  });
});
