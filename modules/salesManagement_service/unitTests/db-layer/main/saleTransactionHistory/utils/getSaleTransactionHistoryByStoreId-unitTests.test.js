const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getSaleTransactionHistoryByStoreId module", () => {
  let sandbox;
  let getSaleTransactionHistoryByStoreId;
  let SaleTransactionHistoryStub;

  const mockData = { id: "123", name: "Test SaleTransactionHistory" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    SaleTransactionHistoryStub = {
      findOne: sandbox.stub().resolves({
        getData: () => mockData,
      }),
    };

    getSaleTransactionHistoryByStoreId = proxyquire(
      "../../../../../src/db-layer/main/SaleTransactionHistory/utils/getSaleTransactionHistoryByStoreId",
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
        },
        sequelize: { Op: require("sequelize").Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getSaleTransactionHistoryByStoreId", () => {
    it("should return getData() if saleTransactionHistory is found", async () => {
      const result = await getSaleTransactionHistoryByStoreId("some-key");
      expect(result).to.deep.equal(mockData);
      sinon.assert.calledOnce(SaleTransactionHistoryStub.findOne);
      sinon.assert.calledWithMatch(SaleTransactionHistoryStub.findOne, {
        where: { storeId: "some-key" },
      });
    });

    it("should return null if saleTransactionHistory is not found", async () => {
      SaleTransactionHistoryStub.findOne.resolves(null);
      const result = await getSaleTransactionHistoryByStoreId("missing-key");
      expect(result).to.equal(null);
    });

    it("should return undefined if getData returns undefined", async () => {
      SaleTransactionHistoryStub.findOne.resolves({ getData: () => undefined });
      const result = await getSaleTransactionHistoryByStoreId("key");
      expect(result).to.be.undefined;
    });

    it("should throw HttpServerError if findOne throws", async () => {
      SaleTransactionHistoryStub.findOne.rejects(new Error("db failure"));

      try {
        await getSaleTransactionHistoryByStoreId("key");
        throw new Error("Expected to throw");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingSaleTransactionHistoryByStoreId",
        );
        expect(err.details.message).to.equal("db failure");
      }
    });
  });
});
