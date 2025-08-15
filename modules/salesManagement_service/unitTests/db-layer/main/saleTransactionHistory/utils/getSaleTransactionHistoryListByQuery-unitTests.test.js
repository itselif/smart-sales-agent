const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getSaleTransactionHistoryListByQuery module", () => {
  let sandbox;
  let getSaleTransactionHistoryListByQuery;
  let SaleTransactionHistoryStub;

  const fakeList = [
    { getData: () => ({ id: "1", name: "Item 1" }) },
    { getData: () => ({ id: "2", name: "Item 2" }) },
  ];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    SaleTransactionHistoryStub = {
      findAll: sandbox.stub().resolves(fakeList),
    };

    getSaleTransactionHistoryListByQuery = proxyquire(
      "../../../../../src/db-layer/main/SaleTransactionHistory/utils/getSaleTransactionHistoryListByQuery",
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

  describe("getSaleTransactionHistoryListByQuery", () => {
    it("should return list of getData() results if query is valid", async () => {
      const result = await getSaleTransactionHistoryListByQuery({
        isActive: true,
      });

      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);

      sinon.assert.calledOnce(SaleTransactionHistoryStub.findAll);
      sinon.assert.calledWithMatch(SaleTransactionHistoryStub.findAll, {
        where: { isActive: true },
      });
    });

    it("should return [] if findAll returns null", async () => {
      SaleTransactionHistoryStub.findAll.resolves(null);

      const result = await getSaleTransactionHistoryListByQuery({
        active: false,
      });
      expect(result).to.deep.equal([]);
    });

    it("should return [] if findAll returns empty array", async () => {
      SaleTransactionHistoryStub.findAll.resolves([]);

      const result = await getSaleTransactionHistoryListByQuery({
        clientId: "xyz",
      });
      expect(result).to.deep.equal([]);
    });

    it("should return list of undefineds if getData() returns undefined", async () => {
      SaleTransactionHistoryStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);

      const result = await getSaleTransactionHistoryListByQuery({
        active: true,
      });
      expect(result).to.deep.equal([undefined, undefined]);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await getSaleTransactionHistoryListByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await getSaleTransactionHistoryListByQuery("not-an-object");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw HttpServerError if findAll fails", async () => {
      SaleTransactionHistoryStub.findAll.rejects(new Error("findAll failed"));

      try {
        await getSaleTransactionHistoryListByQuery({ some: "query" });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingSaleTransactionHistoryListByQuery",
        );
        expect(err.details.message).to.equal("findAll failed");
      }
    });
  });
});
