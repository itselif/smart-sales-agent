const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getIdListOfStoreByField module", () => {
  let sandbox;
  let getIdListOfStoreByField;
  let StoreStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    StoreStub = {
      findAll: sandbox.stub().resolves([{ id: "1" }, { id: "2" }]),
      name: "example-type",
    };

    getIdListOfStoreByField = proxyquire(
      "../../../../../src/db-layer/main/Store/utils/getIdListOfStoreByField",
      {
        models: { Store: StoreStub },
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

  describe("getIdListOfStoreByField", () => {
    it("should return list of IDs when valid field and value is given", async () => {
      StoreStub["name"] = "string";
      const result = await getIdListOfStoreByField("name", "test-value", false);
      expect(result).to.deep.equal(["1", "2"]);
      sinon.assert.calledOnce(StoreStub.findAll);
    });

    it("should return list of IDs using Op.contains if isArray is true", async () => {
      StoreStub["name"] = "string";
      const result = await getIdListOfStoreByField("name", "val", true);
      const call = StoreStub.findAll.getCall(0);
      expect(call.args[0].where["name"][Op.contains]).to.include("val");
    });

    it("should throw BadRequestError if field name is invalid", async () => {
      try {
        await getIdListOfStoreByField("nonexistentField", "x", false);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field name");
      }
    });

    it("should throw BadRequestError if field value has wrong type", async () => {
      StoreStub["name"] = 123; // expects number

      try {
        await getIdListOfStoreByField("name", "wrong-type", false);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field value type");
      }
    });

    it("should throw NotFoundError if no records are found", async () => {
      StoreStub.findAll.resolves([]);
      StoreStub["name"] = "string";

      try {
        await getIdListOfStoreByField("name", "nomatch", false);
        throw new Error("Expected NotFoundError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("NotFoundError");
        expect(err.details.message).to.include(
          "Store with the specified criteria not found",
        );
      }
    });

    it("should wrap findAll error in HttpServerError", async () => {
      StoreStub.findAll.rejects(new Error("query failed"));
      StoreStub["name"] = "string";

      try {
        await getIdListOfStoreByField("name", "test", false);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.message).to.equal("query failed");
      }
    });
  });
});
