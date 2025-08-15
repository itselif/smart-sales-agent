const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getIdListOfInventoryMovementByField module", () => {
  let sandbox;
  let getIdListOfInventoryMovementByField;
  let InventoryMovementStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    InventoryMovementStub = {
      findAll: sandbox.stub().resolves([{ id: "1" }, { id: "2" }]),
      inventoryItemId: "example-type",
    };

    getIdListOfInventoryMovementByField = proxyquire(
      "../../../../../src/db-layer/main/InventoryMovement/utils/getIdListOfInventoryMovementByField",
      {
        models: { InventoryMovement: InventoryMovementStub },
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

  describe("getIdListOfInventoryMovementByField", () => {
    it("should return list of IDs when valid field and value is given", async () => {
      InventoryMovementStub["inventoryItemId"] = "string";
      const result = await getIdListOfInventoryMovementByField(
        "inventoryItemId",
        "test-value",
        false,
      );
      expect(result).to.deep.equal(["1", "2"]);
      sinon.assert.calledOnce(InventoryMovementStub.findAll);
    });

    it("should return list of IDs using Op.contains if isArray is true", async () => {
      InventoryMovementStub["inventoryItemId"] = "string";
      const result = await getIdListOfInventoryMovementByField(
        "inventoryItemId",
        "val",
        true,
      );
      const call = InventoryMovementStub.findAll.getCall(0);
      expect(call.args[0].where["inventoryItemId"][Op.contains]).to.include(
        "val",
      );
    });

    it("should throw BadRequestError if field name is invalid", async () => {
      try {
        await getIdListOfInventoryMovementByField(
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
      InventoryMovementStub["inventoryItemId"] = 123; // expects number

      try {
        await getIdListOfInventoryMovementByField(
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
      InventoryMovementStub.findAll.resolves([]);
      InventoryMovementStub["inventoryItemId"] = "string";

      try {
        await getIdListOfInventoryMovementByField(
          "inventoryItemId",
          "nomatch",
          false,
        );
        throw new Error("Expected NotFoundError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("NotFoundError");
        expect(err.details.message).to.include(
          "InventoryMovement with the specified criteria not found",
        );
      }
    });

    it("should wrap findAll error in HttpServerError", async () => {
      InventoryMovementStub.findAll.rejects(new Error("query failed"));
      InventoryMovementStub["inventoryItemId"] = "string";

      try {
        await getIdListOfInventoryMovementByField(
          "inventoryItemId",
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
