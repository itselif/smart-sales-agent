const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getIdListOfInventoryItemByField module", () => {
  let sandbox;
  let getIdListOfInventoryItemByField;
  let InventoryItemStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    InventoryItemStub = {
      findAll: sandbox.stub().resolves([{ id: "1" }, { id: "2" }]),
      productId: "example-type",
    };

    getIdListOfInventoryItemByField = proxyquire(
      "../../../../../src/db-layer/main/InventoryItem/utils/getIdListOfInventoryItemByField",
      {
        models: { InventoryItem: InventoryItemStub },
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

  describe("getIdListOfInventoryItemByField", () => {
    it("should return list of IDs when valid field and value is given", async () => {
      InventoryItemStub["productId"] = "string";
      const result = await getIdListOfInventoryItemByField(
        "productId",
        "test-value",
        false,
      );
      expect(result).to.deep.equal(["1", "2"]);
      sinon.assert.calledOnce(InventoryItemStub.findAll);
    });

    it("should return list of IDs using Op.contains if isArray is true", async () => {
      InventoryItemStub["productId"] = "string";
      const result = await getIdListOfInventoryItemByField(
        "productId",
        "val",
        true,
      );
      const call = InventoryItemStub.findAll.getCall(0);
      expect(call.args[0].where["productId"][Op.contains]).to.include("val");
    });

    it("should throw BadRequestError if field name is invalid", async () => {
      try {
        await getIdListOfInventoryItemByField("nonexistentField", "x", false);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field name");
      }
    });

    it("should throw BadRequestError if field value has wrong type", async () => {
      InventoryItemStub["productId"] = 123; // expects number

      try {
        await getIdListOfInventoryItemByField("productId", "wrong-type", false);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field value type");
      }
    });

    it("should throw NotFoundError if no records are found", async () => {
      InventoryItemStub.findAll.resolves([]);
      InventoryItemStub["productId"] = "string";

      try {
        await getIdListOfInventoryItemByField("productId", "nomatch", false);
        throw new Error("Expected NotFoundError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("NotFoundError");
        expect(err.details.message).to.include(
          "InventoryItem with the specified criteria not found",
        );
      }
    });

    it("should wrap findAll error in HttpServerError", async () => {
      InventoryItemStub.findAll.rejects(new Error("query failed"));
      InventoryItemStub["productId"] = "string";

      try {
        await getIdListOfInventoryItemByField("productId", "test", false);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.message).to.equal("query failed");
      }
    });
  });
});
