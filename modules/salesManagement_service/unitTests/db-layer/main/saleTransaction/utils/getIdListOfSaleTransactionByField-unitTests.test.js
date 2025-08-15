const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getIdListOfSaleTransactionByField module", () => {
  let sandbox;
  let getIdListOfSaleTransactionByField;
  let SaleTransactionStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    SaleTransactionStub = {
      findAll: sandbox.stub().resolves([{ id: "1" }, { id: "2" }]),
      sellerId: "example-type",
    };

    getIdListOfSaleTransactionByField = proxyquire(
      "../../../../../src/db-layer/main/SaleTransaction/utils/getIdListOfSaleTransactionByField",
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

  describe("getIdListOfSaleTransactionByField", () => {
    it("should return list of IDs when valid field and value is given", async () => {
      SaleTransactionStub["sellerId"] = "string";
      const result = await getIdListOfSaleTransactionByField(
        "sellerId",
        "test-value",
        false,
      );
      expect(result).to.deep.equal(["1", "2"]);
      sinon.assert.calledOnce(SaleTransactionStub.findAll);
    });

    it("should return list of IDs using Op.contains if isArray is true", async () => {
      SaleTransactionStub["sellerId"] = "string";
      const result = await getIdListOfSaleTransactionByField(
        "sellerId",
        "val",
        true,
      );
      const call = SaleTransactionStub.findAll.getCall(0);
      expect(call.args[0].where["sellerId"][Op.contains]).to.include("val");
    });

    it("should throw BadRequestError if field name is invalid", async () => {
      try {
        await getIdListOfSaleTransactionByField("nonexistentField", "x", false);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field name");
      }
    });

    it("should throw BadRequestError if field value has wrong type", async () => {
      SaleTransactionStub["sellerId"] = 123; // expects number

      try {
        await getIdListOfSaleTransactionByField(
          "sellerId",
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
      SaleTransactionStub.findAll.resolves([]);
      SaleTransactionStub["sellerId"] = "string";

      try {
        await getIdListOfSaleTransactionByField("sellerId", "nomatch", false);
        throw new Error("Expected NotFoundError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("NotFoundError");
        expect(err.details.message).to.include(
          "SaleTransaction with the specified criteria not found",
        );
      }
    });

    it("should wrap findAll error in HttpServerError", async () => {
      SaleTransactionStub.findAll.rejects(new Error("query failed"));
      SaleTransactionStub["sellerId"] = "string";

      try {
        await getIdListOfSaleTransactionByField("sellerId", "test", false);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.message).to.equal("query failed");
      }
    });
  });
});
