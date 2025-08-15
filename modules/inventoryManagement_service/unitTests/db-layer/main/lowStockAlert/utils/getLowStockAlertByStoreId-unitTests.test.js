const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getLowStockAlertByStoreId module", () => {
  let sandbox;
  let getLowStockAlertByStoreId;
  let LowStockAlertStub;

  const mockData = { id: "123", name: "Test LowStockAlert" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    LowStockAlertStub = {
      findOne: sandbox.stub().resolves({
        getData: () => mockData,
      }),
    };

    getLowStockAlertByStoreId = proxyquire(
      "../../../../../src/db-layer/main/LowStockAlert/utils/getLowStockAlertByStoreId",
      {
        models: { LowStockAlert: LowStockAlertStub },
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

  describe("getLowStockAlertByStoreId", () => {
    it("should return getData() if lowStockAlert is found", async () => {
      const result = await getLowStockAlertByStoreId("some-key");
      expect(result).to.deep.equal(mockData);
      sinon.assert.calledOnce(LowStockAlertStub.findOne);
      sinon.assert.calledWithMatch(LowStockAlertStub.findOne, {
        where: { storeId: "some-key" },
      });
    });

    it("should return null if lowStockAlert is not found", async () => {
      LowStockAlertStub.findOne.resolves(null);
      const result = await getLowStockAlertByStoreId("missing-key");
      expect(result).to.equal(null);
    });

    it("should return undefined if getData returns undefined", async () => {
      LowStockAlertStub.findOne.resolves({ getData: () => undefined });
      const result = await getLowStockAlertByStoreId("key");
      expect(result).to.be.undefined;
    });

    it("should throw HttpServerError if findOne throws", async () => {
      LowStockAlertStub.findOne.rejects(new Error("db failure"));

      try {
        await getLowStockAlertByStoreId("key");
        throw new Error("Expected to throw");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingLowStockAlertByStoreId",
        );
        expect(err.details.message).to.equal("db failure");
      }
    });
  });
});
