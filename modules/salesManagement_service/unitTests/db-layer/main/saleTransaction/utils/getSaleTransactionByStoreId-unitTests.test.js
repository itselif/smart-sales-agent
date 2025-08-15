const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getSaleTransactionByStoreId module", () => {
  let sandbox;
  let getSaleTransactionByStoreId;
  let SaleTransactionStub;

  const mockData = { id: "123", name: "Test SaleTransaction" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    SaleTransactionStub = {
      findOne: sandbox.stub().resolves({
        getData: () => mockData,
      }),
    };

    getSaleTransactionByStoreId = proxyquire(
      "../../../../../src/db-layer/main/SaleTransaction/utils/getSaleTransactionByStoreId",
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
        },
        sequelize: { Op: require("sequelize").Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getSaleTransactionByStoreId", () => {
    it("should return getData() if saleTransaction is found", async () => {
      const result = await getSaleTransactionByStoreId("some-key");
      expect(result).to.deep.equal(mockData);
      sinon.assert.calledOnce(SaleTransactionStub.findOne);
      sinon.assert.calledWithMatch(SaleTransactionStub.findOne, {
        where: { storeId: "some-key" },
      });
    });

    it("should return null if saleTransaction is not found", async () => {
      SaleTransactionStub.findOne.resolves(null);
      const result = await getSaleTransactionByStoreId("missing-key");
      expect(result).to.equal(null);
    });

    it("should return undefined if getData returns undefined", async () => {
      SaleTransactionStub.findOne.resolves({ getData: () => undefined });
      const result = await getSaleTransactionByStoreId("key");
      expect(result).to.be.undefined;
    });

    it("should throw HttpServerError if findOne throws", async () => {
      SaleTransactionStub.findOne.rejects(new Error("db failure"));

      try {
        await getSaleTransactionByStoreId("key");
        throw new Error("Expected to throw");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingSaleTransactionByStoreId",
        );
        expect(err.details.message).to.equal("db failure");
      }
    });
  });
});
