const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getIdListOfReportFileByField module", () => {
  let sandbox;
  let getIdListOfReportFileByField;
  let ReportFileStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ReportFileStub = {
      findAll: sandbox.stub().resolves([{ id: "1" }, { id: "2" }]),
      reportRequestId: "example-type",
    };

    getIdListOfReportFileByField = proxyquire(
      "../../../../../src/db-layer/main/ReportFile/utils/getIdListOfReportFileByField",
      {
        models: { ReportFile: ReportFileStub },
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

  describe("getIdListOfReportFileByField", () => {
    it("should return list of IDs when valid field and value is given", async () => {
      ReportFileStub["reportRequestId"] = "string";
      const result = await getIdListOfReportFileByField(
        "reportRequestId",
        "test-value",
        false,
      );
      expect(result).to.deep.equal(["1", "2"]);
      sinon.assert.calledOnce(ReportFileStub.findAll);
    });

    it("should return list of IDs using Op.contains if isArray is true", async () => {
      ReportFileStub["reportRequestId"] = "string";
      const result = await getIdListOfReportFileByField(
        "reportRequestId",
        "val",
        true,
      );
      const call = ReportFileStub.findAll.getCall(0);
      expect(call.args[0].where["reportRequestId"][Op.contains]).to.include(
        "val",
      );
    });

    it("should throw BadRequestError if field name is invalid", async () => {
      try {
        await getIdListOfReportFileByField("nonexistentField", "x", false);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field name");
      }
    });

    it("should throw BadRequestError if field value has wrong type", async () => {
      ReportFileStub["reportRequestId"] = 123; // expects number

      try {
        await getIdListOfReportFileByField(
          "reportRequestId",
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
      ReportFileStub.findAll.resolves([]);
      ReportFileStub["reportRequestId"] = "string";

      try {
        await getIdListOfReportFileByField("reportRequestId", "nomatch", false);
        throw new Error("Expected NotFoundError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("NotFoundError");
        expect(err.details.message).to.include(
          "ReportFile with the specified criteria not found",
        );
      }
    });

    it("should wrap findAll error in HttpServerError", async () => {
      ReportFileStub.findAll.rejects(new Error("query failed"));
      ReportFileStub["reportRequestId"] = "string";

      try {
        await getIdListOfReportFileByField("reportRequestId", "test", false);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.message).to.equal("query failed");
      }
    });
  });
});
