const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getSaleTransactionHistoryByQuery module", () => {
  let sandbox;
  let getSaleTransactionHistoryByQuery;
  let SaleTransactionHistoryStub;

  const fakeId = "uuid-123";
  const fakeRecord = {
    id: fakeId,
    name: "Test SaleTransactionHistory",
    getData: () => ({ id: fakeId, name: "Test SaleTransactionHistory" }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    SaleTransactionHistoryStub = {
      findOne: sandbox.stub().resolves(fakeRecord),
    };

    getSaleTransactionHistoryByQuery = proxyquire(
      "../../../../../src/db-layer/main/SaleTransactionHistory/utils/getSaleTransactionHistoryByQuery",
      {
        models: { SaleTransactionHistory: SaleTransactionHistoryStub },
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

  describe("getSaleTransactionHistoryByQuery", () => {
    it("should return the result of getData if found", async () => {
      const result = await getSaleTransactionHistoryByQuery({ id: fakeId });

      expect(result).to.deep.equal({
        id: fakeId,
        name: "Test SaleTransactionHistory",
      });
      sinon.assert.calledOnce(SaleTransactionHistoryStub.findOne);
      sinon.assert.calledWith(SaleTransactionHistoryStub.findOne, {
        where: {
          id: fakeId,
          isActive: true,
        },
      });
    });

    it("should return null if no record is found", async () => {
      SaleTransactionHistoryStub.findOne.resolves(null);

      const result = await getSaleTransactionHistoryByQuery({ id: fakeId });

      expect(result).to.be.null;
      sinon.assert.calledOnce(SaleTransactionHistoryStub.findOne);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await getSaleTransactionHistoryByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await getSaleTransactionHistoryByQuery("invalid-query");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should wrap findOne errors in HttpServerError", async () => {
      SaleTransactionHistoryStub.findOne.rejects(new Error("findOne failed"));

      try {
        await getSaleTransactionHistoryByQuery({ test: true });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingSaleTransactionHistoryByQuery",
        );
        expect(err.details.message).to.equal("findOne failed");
      }
    });

    it("should return undefined if getData returns undefined", async () => {
      SaleTransactionHistoryStub.findOne.resolves({ getData: () => undefined });

      const result = await getSaleTransactionHistoryByQuery({ id: fakeId });

      expect(result).to.be.undefined;
    });
  });
});
