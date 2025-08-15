const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getIdListOfLowStockAlertByField module", () => {
  let sandbox;
  let getIdListOfLowStockAlertByField;
  let LowStockAlertStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    LowStockAlertStub = {
      findAll: sandbox.stub().resolves([{ id: "1" }, { id: "2" }]),
      inventoryItemId: "example-type",
    };

    getIdListOfLowStockAlertByField = proxyquire(
      "../../../../../src/db-layer/main/LowStockAlert/utils/getIdListOfLowStockAlertByField",
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

  describe("getIdListOfLowStockAlertByField", () => {
    it("should return list of IDs when valid field and value is given", async () => {
      LowStockAlertStub["inventoryItemId"] = "string";
      const result = await getIdListOfLowStockAlertByField(
        "inventoryItemId",
        "test-value",
        false,
      );
      expect(result).to.deep.equal(["1", "2"]);
      sinon.assert.calledOnce(LowStockAlertStub.findAll);
    });

    it("should return list of IDs using Op.contains if isArray is true", async () => {
      LowStockAlertStub["inventoryItemId"] = "string";
      const result = await getIdListOfLowStockAlertByField(
        "inventoryItemId",
        "val",
        true,
      );
      const call = LowStockAlertStub.findAll.getCall(0);
      expect(call.args[0].where["inventoryItemId"][Op.contains]).to.include(
        "val",
      );
    });

    it("should throw BadRequestError if field name is invalid", async () => {
      try {
        await getIdListOfLowStockAlertByField("nonexistentField", "x", false);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field name");
      }
    });

    it("should throw BadRequestError if field value has wrong type", async () => {
      LowStockAlertStub["inventoryItemId"] = 123; // expects number

      try {
        await getIdListOfLowStockAlertByField(
          "inventoryItemId",
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
      LowStockAlertStub.findAll.resolves([]);
      LowStockAlertStub["inventoryItemId"] = "string";

      try {
        await getIdListOfLowStockAlertByField(
          "inventoryItemId",
          "nomatch",
          false,
        );
        throw new Error("Expected NotFoundError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("NotFoundError");
        expect(err.details.message).to.include(
          "LowStockAlert with the specified criteria not found",
        );
      }
    });

    it("should wrap findAll error in HttpServerError", async () => {
      LowStockAlertStub.findAll.rejects(new Error("query failed"));
      LowStockAlertStub["inventoryItemId"] = "string";

      try {
        await getIdListOfLowStockAlertByField("inventoryItemId", "test", false);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.message).to.equal("query failed");
      }
    });
  });
});
