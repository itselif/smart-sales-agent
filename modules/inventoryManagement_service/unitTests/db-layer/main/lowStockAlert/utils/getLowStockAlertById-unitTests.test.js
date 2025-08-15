const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getLowStockAlertById module", () => {
  let sandbox;
  let getLowStockAlertById;
  let LowStockAlertStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test LowStockAlert" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    LowStockAlertStub = {
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

    getLowStockAlertById = proxyquire(
      "../../../../../src/db-layer/main/LowStockAlert/utils/getLowStockAlertById",
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

  describe("getLowStockAlertById", () => {
    it("should return getData() for single ID", async () => {
      const result = await getLowStockAlertById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(LowStockAlertStub.findOne);
      sinon.assert.calledWith(
        LowStockAlertStub.findOne,
        sinon.match.has("where", sinon.match.has("id", fakeId)),
      );
    });

    it("should return mapped getData() results for array of IDs", async () => {
      const result = await getLowStockAlertById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(LowStockAlertStub.findAll);
      sinon.assert.calledWithMatch(LowStockAlertStub.findAll, {
        where: { id: { [Op.in]: ["1", "2"] } },
      });
    });

    it("should return null if record not found (single ID)", async () => {
      LowStockAlertStub.findOne.resolves(null);
      const result = await getLowStockAlertById(fakeId);
      expect(result).to.be.null;
    });

    it("should return null if empty array returned from findAll", async () => {
      LowStockAlertStub.findAll.resolves([]);
      const result = await getLowStockAlertById(["a", "b"]);
      expect(result).to.deep.equal([]);
    });

    it("should wrap unexpected errors with HttpServerError (single ID)", async () => {
      LowStockAlertStub.findOne.rejects(new Error("DB failure"));
      try {
        await getLowStockAlertById("test");
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingLowStockAlertById",
        );
        expect(err.details.message).to.equal("DB failure");
      }
    });

    it("should wrap unexpected errors with HttpServerError (array of IDs)", async () => {
      LowStockAlertStub.findAll.rejects(new Error("array failure"));
      try {
        await getLowStockAlertById(["fail"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingLowStockAlertById",
        );
        expect(err.details.message).to.equal("array failure");
      }
    });

    it("should return undefined if getData() returns undefined", async () => {
      LowStockAlertStub.findOne.resolves({ getData: () => undefined });
      const result = await getLowStockAlertById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should return array of undefineds if getData() returns undefined per item", async () => {
      LowStockAlertStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getLowStockAlertById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });
  });
});
