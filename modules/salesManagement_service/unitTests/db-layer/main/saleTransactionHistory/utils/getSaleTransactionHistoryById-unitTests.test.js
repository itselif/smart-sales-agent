const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getSaleTransactionHistoryById module", () => {
  let sandbox;
  let getSaleTransactionHistoryById;
  let SaleTransactionHistoryStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test SaleTransactionHistory" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    SaleTransactionHistoryStub = {
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

    getSaleTransactionHistoryById = proxyquire(
      "../../../../../src/db-layer/main/SaleTransactionHistory/utils/getSaleTransactionHistoryById",
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
        sequelize: { Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getSaleTransactionHistoryById", () => {
    it("should return getData() for single ID", async () => {
      const result = await getSaleTransactionHistoryById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(SaleTransactionHistoryStub.findOne);
      sinon.assert.calledWith(
        SaleTransactionHistoryStub.findOne,
        sinon.match.has("where", sinon.match.has("id", fakeId)),
      );
    });

    it("should return mapped getData() results for array of IDs", async () => {
      const result = await getSaleTransactionHistoryById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(SaleTransactionHistoryStub.findAll);
      sinon.assert.calledWithMatch(SaleTransactionHistoryStub.findAll, {
        where: { id: { [Op.in]: ["1", "2"] } },
      });
    });

    it("should return null if record not found (single ID)", async () => {
      SaleTransactionHistoryStub.findOne.resolves(null);
      const result = await getSaleTransactionHistoryById(fakeId);
      expect(result).to.be.null;
    });

    it("should return null if empty array returned from findAll", async () => {
      SaleTransactionHistoryStub.findAll.resolves([]);
      const result = await getSaleTransactionHistoryById(["a", "b"]);
      expect(result).to.deep.equal([]);
    });

    it("should wrap unexpected errors with HttpServerError (single ID)", async () => {
      SaleTransactionHistoryStub.findOne.rejects(new Error("DB failure"));
      try {
        await getSaleTransactionHistoryById("test");
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingSaleTransactionHistoryById",
        );
        expect(err.details.message).to.equal("DB failure");
      }
    });

    it("should wrap unexpected errors with HttpServerError (array of IDs)", async () => {
      SaleTransactionHistoryStub.findAll.rejects(new Error("array failure"));
      try {
        await getSaleTransactionHistoryById(["fail"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingSaleTransactionHistoryById",
        );
        expect(err.details.message).to.equal("array failure");
      }
    });

    it("should return undefined if getData() returns undefined", async () => {
      SaleTransactionHistoryStub.findOne.resolves({ getData: () => undefined });
      const result = await getSaleTransactionHistoryById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should return array of undefineds if getData() returns undefined per item", async () => {
      SaleTransactionHistoryStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getSaleTransactionHistoryById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });
  });
});
