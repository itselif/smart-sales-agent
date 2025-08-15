const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getIdListOfSaleTransactionHistoryByField module", () => {
  let sandbox;
  let getIdListOfSaleTransactionHistoryByField;
  let SaleTransactionHistoryStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    SaleTransactionHistoryStub = {
      findAll: sandbox.stub().resolves([{ id: "1" }, { id: "2" }]),
      transactionId: "example-type",
    };

    getIdListOfSaleTransactionHistoryByField = proxyquire(
      "../../../../../src/db-layer/main/SaleTransactionHistory/utils/getIdListOfSaleTransactionHistoryByField",
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
          NotFoundError: class NotFoundError extends Error {
            constructor(msg) {
              super(msg);
              this.name = "NotFoundError";
            }
          },
        },
        sequelize: { Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getIdListOfSaleTransactionHistoryByField", () => {
    it("should return list of IDs when valid field and value is given", async () => {
      SaleTransactionHistoryStub["transactionId"] = "string";
      const result = await getIdListOfSaleTransactionHistoryByField(
        "transactionId",
        "test-value",
        false,
      );
      expect(result).to.deep.equal(["1", "2"]);
      sinon.assert.calledOnce(SaleTransactionHistoryStub.findAll);
    });

    it("should return list of IDs using Op.contains if isArray is true", async () => {
      SaleTransactionHistoryStub["transactionId"] = "string";
      const result = await getIdListOfSaleTransactionHistoryByField(
        "transactionId",
        "val",
        true,
      );
      const call = SaleTransactionHistoryStub.findAll.getCall(0);
      expect(call.args[0].where["transactionId"][Op.contains]).to.include(
        "val",
      );
    });

    it("should throw BadRequestError if field name is invalid", async () => {
      try {
        await getIdListOfSaleTransactionHistoryByField(
          "nonexistentField",
          "x",
          false,
        );
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field name");
      }
    });

    it("should throw BadRequestError if field value has wrong type", async () => {
      SaleTransactionHistoryStub["transactionId"] = 123; // expects number

      try {
        await getIdListOfSaleTransactionHistoryByField(
          "transactionId",
          "wrong-type",
          false,
        );
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field value type");
      }
    });

    it("should throw NotFoundError if no records are found", async () => {
      SaleTransactionHistoryStub.findAll.resolves([]);
      SaleTransactionHistoryStub["transactionId"] = "string";

      try {
        await getIdListOfSaleTransactionHistoryByField(
          "transactionId",
          "nomatch",
          false,
        );
        throw new Error("Expected NotFoundError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("NotFoundError");
        expect(err.details.message).to.include(
          "SaleTransactionHistory with the specified criteria not found",
        );
      }
    });

    it("should wrap findAll error in HttpServerError", async () => {
      SaleTransactionHistoryStub.findAll.rejects(new Error("query failed"));
      SaleTransactionHistoryStub["transactionId"] = "string";

      try {
        await getIdListOfSaleTransactionHistoryByField(
          "transactionId",
          "test",
          false,
        );
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.message).to.equal("query failed");
      }
    });
  });
});
