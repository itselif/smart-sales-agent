const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getLowStockAlertAggById module", () => {
  let sandbox;
  let getLowStockAlertAggById;
  let LowStockAlertStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test LowStockAlert" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    LowStockAlertStub = {
      findOne: sandbox.stub().resolves({ getData: () => fakeData }),
      findAll: sandbox
        .stub()
        .resolves([
          { getData: () => ({ id: "1", name: "Item 1" }) },
          { getData: () => ({ id: "2", name: "Item 2" }) },
        ]),
      getCqrsJoins: sandbox.stub().resolves(),
    };

    getLowStockAlertAggById = proxyquire(
      "../../../../../src/db-layer/main/LowStockAlert/utils/getLowStockAlertAggById",
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
        sequelize: { Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getLowStockAlertAggById", () => {
    it("should return getData() with includes for single ID", async () => {
      const result = await getLowStockAlertAggById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(LowStockAlertStub.findOne);
      sinon.assert.calledOnce(LowStockAlertStub.getCqrsJoins);
    });

    it("should return mapped getData() for array of IDs", async () => {
      const result = await getLowStockAlertAggById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(LowStockAlertStub.findAll);
      sinon.assert.calledOnce(LowStockAlertStub.getCqrsJoins);
    });

    it("should return null if not found for single ID", async () => {
      LowStockAlertStub.findOne.resolves(null);
      const result = await getLowStockAlertAggById(fakeId);
      expect(result).to.equal(null);
    });

    it("should return empty array if input is array but no results", async () => {
      LowStockAlertStub.findAll.resolves([]);
      const result = await getLowStockAlertAggById(["nope"]);
      expect(result).to.deep.equal([]);
    });

    it("should return undefined if getData returns undefined in array items", async () => {
      LowStockAlertStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getLowStockAlertAggById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });

    it("should return undefined if getData returns undefined in single ID", async () => {
      LowStockAlertStub.findOne.resolves({ getData: () => undefined });
      const result = await getLowStockAlertAggById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should throw HttpServerError on unexpected error (findOne)", async () => {
      LowStockAlertStub.findOne.rejects(new Error("fail"));
      try {
        await getLowStockAlertAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingLowStockAlertAggById",
        );
        expect(err.details.message).to.equal("fail");
      }
    });

    it("should throw HttpServerError on unexpected error (findAll)", async () => {
      LowStockAlertStub.findAll.rejects(new Error("all fail"));
      try {
        await getLowStockAlertAggById(["1"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingLowStockAlertAggById",
        );
        expect(err.details.message).to.equal("all fail");
      }
    });

    it("should throw HttpServerError if getCqrsJoins fails", async () => {
      LowStockAlertStub.getCqrsJoins.rejects(new Error("joins fail"));
      try {
        await getLowStockAlertAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingLowStockAlertAggById",
        );
        expect(err.details.message).to.equal("joins fail");
      }
    });
  });
});
