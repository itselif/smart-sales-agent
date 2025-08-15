const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getSaleTransactionById module", () => {
  let sandbox;
  let getSaleTransactionById;
  let SaleTransactionStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test SaleTransaction" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    SaleTransactionStub = {
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

    getSaleTransactionById = proxyquire(
      "../../../../../src/db-layer/main/SaleTransaction/utils/getSaleTransactionById",
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
        sequelize: { Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getSaleTransactionById", () => {
    it("should return getData() for single ID", async () => {
      const result = await getSaleTransactionById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(SaleTransactionStub.findOne);
      sinon.assert.calledWith(
        SaleTransactionStub.findOne,
        sinon.match.has("where", sinon.match.has("id", fakeId)),
      );
    });

    it("should return mapped getData() results for array of IDs", async () => {
      const result = await getSaleTransactionById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(SaleTransactionStub.findAll);
      sinon.assert.calledWithMatch(SaleTransactionStub.findAll, {
        where: { id: { [Op.in]: ["1", "2"] } },
      });
    });

    it("should return null if record not found (single ID)", async () => {
      SaleTransactionStub.findOne.resolves(null);
      const result = await getSaleTransactionById(fakeId);
      expect(result).to.be.null;
    });

    it("should return null if empty array returned from findAll", async () => {
      SaleTransactionStub.findAll.resolves([]);
      const result = await getSaleTransactionById(["a", "b"]);
      expect(result).to.deep.equal([]);
    });

    it("should wrap unexpected errors with HttpServerError (single ID)", async () => {
      SaleTransactionStub.findOne.rejects(new Error("DB failure"));
      try {
        await getSaleTransactionById("test");
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingSaleTransactionById",
        );
        expect(err.details.message).to.equal("DB failure");
      }
    });

    it("should wrap unexpected errors with HttpServerError (array of IDs)", async () => {
      SaleTransactionStub.findAll.rejects(new Error("array failure"));
      try {
        await getSaleTransactionById(["fail"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingSaleTransactionById",
        );
        expect(err.details.message).to.equal("array failure");
      }
    });

    it("should return undefined if getData() returns undefined", async () => {
      SaleTransactionStub.findOne.resolves({ getData: () => undefined });
      const result = await getSaleTransactionById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should return array of undefineds if getData() returns undefined per item", async () => {
      SaleTransactionStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getSaleTransactionById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });
  });
});
