const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getStoreByOwnerId module", () => {
  let sandbox;
  let getStoreByOwnerId;
  let StoreStub;

  const mockData = { id: "123", name: "Test Store" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    StoreStub = {
      findOne: sandbox.stub().resolves({
        getData: () => mockData,
      }),
    };

    getStoreByOwnerId = proxyquire(
      "../../../../../src/db-layer/main/Store/utils/getStoreByOwnerId",
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
        },
        sequelize: { Op: require("sequelize").Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getStoreByOwnerId", () => {
    it("should return getData() if store is found", async () => {
      const result = await getStoreByOwnerId("some-key");
      expect(result).to.deep.equal(mockData);
      sinon.assert.calledOnce(StoreStub.findOne);
      sinon.assert.calledWithMatch(StoreStub.findOne, {
        where: { ownerId: "some-key" },
      });
    });

    it("should return null if store is not found", async () => {
      StoreStub.findOne.resolves(null);
      const result = await getStoreByOwnerId("missing-key");
      expect(result).to.equal(null);
    });

    it("should return undefined if getData returns undefined", async () => {
      StoreStub.findOne.resolves({ getData: () => undefined });
      const result = await getStoreByOwnerId("key");
      expect(result).to.be.undefined;
    });

    it("should throw HttpServerError if findOne throws", async () => {
      StoreStub.findOne.rejects(new Error("db failure"));

      try {
        await getStoreByOwnerId("key");
        throw new Error("Expected to throw");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingStoreByOwnerId",
        );
        expect(err.details.message).to.equal("db failure");
      }
    });
  });
});
