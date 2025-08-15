const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getIdListOfReportPolicyByField module", () => {
  let sandbox;
  let getIdListOfReportPolicyByField;
  let ReportPolicyStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ReportPolicyStub = {
      findAll: sandbox.stub().resolves([{ id: "1" }, { id: "2" }]),
      reportType: "example-type",
    };

    getIdListOfReportPolicyByField = proxyquire(
      "../../../../../src/db-layer/main/ReportPolicy/utils/getIdListOfReportPolicyByField",
      {
        models: { ReportPolicy: ReportPolicyStub },
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

  describe("getIdListOfReportPolicyByField", () => {
    it("should return list of IDs when valid field and value is given", async () => {
      ReportPolicyStub["reportType"] = "string";
      const result = await getIdListOfReportPolicyByField(
        "reportType",
        "test-value",
        false,
      );
      expect(result).to.deep.equal(["1", "2"]);
      sinon.assert.calledOnce(ReportPolicyStub.findAll);
    });

    it("should return list of IDs using Op.contains if isArray is true", async () => {
      ReportPolicyStub["reportType"] = "string";
      const result = await getIdListOfReportPolicyByField(
        "reportType",
        "val",
        true,
      );
      const call = ReportPolicyStub.findAll.getCall(0);
      expect(call.args[0].where["reportType"][Op.contains]).to.include("val");
    });

    it("should throw BadRequestError if field name is invalid", async () => {
      try {
        await getIdListOfReportPolicyByField("nonexistentField", "x", false);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field name");
      }
    });

    it("should throw BadRequestError if field value has wrong type", async () => {
      ReportPolicyStub["reportType"] = 123; // expects number

      try {
        await getIdListOfReportPolicyByField("reportType", "wrong-type", false);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field value type");
      }
    });

    it("should throw NotFoundError if no records are found", async () => {
      ReportPolicyStub.findAll.resolves([]);
      ReportPolicyStub["reportType"] = "string";

      try {
        await getIdListOfReportPolicyByField("reportType", "nomatch", false);
        throw new Error("Expected NotFoundError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("NotFoundError");
        expect(err.details.message).to.include(
          "ReportPolicy with the specified criteria not found",
        );
      }
    });

    it("should wrap findAll error in HttpServerError", async () => {
      ReportPolicyStub.findAll.rejects(new Error("query failed"));
      ReportPolicyStub["reportType"] = "string";

      try {
        await getIdListOfReportPolicyByField("reportType", "test", false);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.message).to.equal("query failed");
      }
    });
  });
});
