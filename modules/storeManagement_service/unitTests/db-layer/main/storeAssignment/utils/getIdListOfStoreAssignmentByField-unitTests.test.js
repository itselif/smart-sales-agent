const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getIdListOfStoreAssignmentByField module", () => {
  let sandbox;
  let getIdListOfStoreAssignmentByField;
  let StoreAssignmentStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    StoreAssignmentStub = {
      findAll: sandbox.stub().resolves([{ id: "1" }, { id: "2" }]),
      userId: "example-type",
    };

    getIdListOfStoreAssignmentByField = proxyquire(
      "../../../../../src/db-layer/main/StoreAssignment/utils/getIdListOfStoreAssignmentByField",
      {
        models: { StoreAssignment: StoreAssignmentStub },
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

  describe("getIdListOfStoreAssignmentByField", () => {
    it("should return list of IDs when valid field and value is given", async () => {
      StoreAssignmentStub["userId"] = "string";
      const result = await getIdListOfStoreAssignmentByField(
        "userId",
        "test-value",
        false,
      );
      expect(result).to.deep.equal(["1", "2"]);
      sinon.assert.calledOnce(StoreAssignmentStub.findAll);
    });

    it("should return list of IDs using Op.contains if isArray is true", async () => {
      StoreAssignmentStub["userId"] = "string";
      const result = await getIdListOfStoreAssignmentByField(
        "userId",
        "val",
        true,
      );
      const call = StoreAssignmentStub.findAll.getCall(0);
      expect(call.args[0].where["userId"][Op.contains]).to.include("val");
    });

    it("should throw BadRequestError if field name is invalid", async () => {
      try {
        await getIdListOfStoreAssignmentByField("nonexistentField", "x", false);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field name");
      }
    });

    it("should throw BadRequestError if field value has wrong type", async () => {
      StoreAssignmentStub["userId"] = 123; // expects number

      try {
        await getIdListOfStoreAssignmentByField("userId", "wrong-type", false);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field value type");
      }
    });

    it("should throw NotFoundError if no records are found", async () => {
      StoreAssignmentStub.findAll.resolves([]);
      StoreAssignmentStub["userId"] = "string";

      try {
        await getIdListOfStoreAssignmentByField("userId", "nomatch", false);
        throw new Error("Expected NotFoundError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("NotFoundError");
        expect(err.details.message).to.include(
          "StoreAssignment with the specified criteria not found",
        );
      }
    });

    it("should wrap findAll error in HttpServerError", async () => {
      StoreAssignmentStub.findAll.rejects(new Error("query failed"));
      StoreAssignmentStub["userId"] = "string";

      try {
        await getIdListOfStoreAssignmentByField("userId", "test", false);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.message).to.equal("query failed");
      }
    });
  });
});
