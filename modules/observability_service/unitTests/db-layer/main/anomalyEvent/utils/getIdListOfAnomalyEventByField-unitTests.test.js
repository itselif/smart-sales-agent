const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getIdListOfAnomalyEventByField module", () => {
  let sandbox;
  let getIdListOfAnomalyEventByField;
  let AnomalyEventStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    AnomalyEventStub = {
      findAll: sandbox.stub().resolves([{ id: "1" }, { id: "2" }]),
      anomalyType: "example-type",
    };

    getIdListOfAnomalyEventByField = proxyquire(
      "../../../../../src/db-layer/main/AnomalyEvent/utils/getIdListOfAnomalyEventByField",
      {
        models: { AnomalyEvent: AnomalyEventStub },
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

  describe("getIdListOfAnomalyEventByField", () => {
    it("should return list of IDs when valid field and value is given", async () => {
      AnomalyEventStub["anomalyType"] = "string";
      const result = await getIdListOfAnomalyEventByField(
        "anomalyType",
        "test-value",
        false,
      );
      expect(result).to.deep.equal(["1", "2"]);
      sinon.assert.calledOnce(AnomalyEventStub.findAll);
    });

    it("should return list of IDs using Op.contains if isArray is true", async () => {
      AnomalyEventStub["anomalyType"] = "string";
      const result = await getIdListOfAnomalyEventByField(
        "anomalyType",
        "val",
        true,
      );
      const call = AnomalyEventStub.findAll.getCall(0);
      expect(call.args[0].where["anomalyType"][Op.contains]).to.include("val");
    });

    it("should throw BadRequestError if field name is invalid", async () => {
      try {
        await getIdListOfAnomalyEventByField("nonexistentField", "x", false);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field name");
      }
    });

    it("should throw BadRequestError if field value has wrong type", async () => {
      AnomalyEventStub["anomalyType"] = 123; // expects number

      try {
        await getIdListOfAnomalyEventByField(
          "anomalyType",
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
      AnomalyEventStub.findAll.resolves([]);
      AnomalyEventStub["anomalyType"] = "string";

      try {
        await getIdListOfAnomalyEventByField("anomalyType", "nomatch", false);
        throw new Error("Expected NotFoundError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("NotFoundError");
        expect(err.details.message).to.include(
          "AnomalyEvent with the specified criteria not found",
        );
      }
    });

    it("should wrap findAll error in HttpServerError", async () => {
      AnomalyEventStub.findAll.rejects(new Error("query failed"));
      AnomalyEventStub["anomalyType"] = "string";

      try {
        await getIdListOfAnomalyEventByField("anomalyType", "test", false);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.message).to.equal("query failed");
      }
    });
  });
});
