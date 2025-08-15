const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getIdListOfReportRequestByField module", () => {
  let sandbox;
  let getIdListOfReportRequestByField;
  let ReportRequestStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ReportRequestStub = {
      findAll: sandbox.stub().resolves([{ id: "1" }, { id: "2" }]),
      requestedByUserId: "example-type",
    };

    getIdListOfReportRequestByField = proxyquire(
      "../../../../../src/db-layer/main/ReportRequest/utils/getIdListOfReportRequestByField",
      {
        models: { ReportRequest: ReportRequestStub },
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

  describe("getIdListOfReportRequestByField", () => {
    it("should return list of IDs when valid field and value is given", async () => {
      ReportRequestStub["requestedByUserId"] = "string";
      const result = await getIdListOfReportRequestByField(
        "requestedByUserId",
        "test-value",
        false,
      );
      expect(result).to.deep.equal(["1", "2"]);
      sinon.assert.calledOnce(ReportRequestStub.findAll);
    });

    it("should return list of IDs using Op.contains if isArray is true", async () => {
      ReportRequestStub["requestedByUserId"] = "string";
      const result = await getIdListOfReportRequestByField(
        "requestedByUserId",
        "val",
        true,
      );
      const call = ReportRequestStub.findAll.getCall(0);
      expect(call.args[0].where["requestedByUserId"][Op.contains]).to.include(
        "val",
      );
    });

    it("should throw BadRequestError if field name is invalid", async () => {
      try {
        await getIdListOfReportRequestByField("nonexistentField", "x", false);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field name");
      }
    });

    it("should throw BadRequestError if field value has wrong type", async () => {
      ReportRequestStub["requestedByUserId"] = 123; // expects number

      try {
        await getIdListOfReportRequestByField(
          "requestedByUserId",
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
      ReportRequestStub.findAll.resolves([]);
      ReportRequestStub["requestedByUserId"] = "string";

      try {
        await getIdListOfReportRequestByField(
          "requestedByUserId",
          "nomatch",
          false,
        );
        throw new Error("Expected NotFoundError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("NotFoundError");
        expect(err.details.message).to.include(
          "ReportRequest with the specified criteria not found",
        );
      }
    });

    it("should wrap findAll error in HttpServerError", async () => {
      ReportRequestStub.findAll.rejects(new Error("query failed"));
      ReportRequestStub["requestedByUserId"] = "string";

      try {
        await getIdListOfReportRequestByField(
          "requestedByUserId",
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
