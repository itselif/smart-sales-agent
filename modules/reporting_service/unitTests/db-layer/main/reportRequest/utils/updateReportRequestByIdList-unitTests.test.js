const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("updateReportRequestByIdList module", () => {
  let sandbox;
  let updateReportRequestByIdList;
  let ReportRequestStub;

  const fakeIdList = ["id1", "id2"];
  const fakeUpdatedRows = [
    { id: "id1", name: "Updated 1" },
    { id: "id2", name: "Updated 2" },
  ];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ReportRequestStub = {
      update: sandbox.stub().resolves([2, fakeUpdatedRows]),
    };

    updateReportRequestByIdList = proxyquire(
      "../../../../../src/db-layer/main/ReportRequest/utils/updateReportRequestByIdList",
      {
        models: { ReportRequest: ReportRequestStub },
        common: {
          HttpServerError: class HttpServerError extends Error {
            constructor(message, details) {
              super(message);
              this.name = "HttpServerError";
              this.details = details;
            }
          },
          hexaLogger: { insertError: sandbox.stub() },
        },
        sequelize: { Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("updateReportRequestByIdList", () => {
    it("should return list of updated IDs if update is successful", async () => {
      const result = await updateReportRequestByIdList(fakeIdList, {
        name: "Updated",
      });

      expect(result).to.deep.equal(["id1", "id2"]);
      sinon.assert.calledOnce(ReportRequestStub.update);
      const args = ReportRequestStub.update.getCall(0).args;
      expect(args[0]).to.deep.equal({ name: "Updated" });
      expect(args[1]).to.deep.equal({
        where: { id: { [Op.in]: fakeIdList }, isActive: true },
        returning: true,
      });
    });

    it("should return empty list if update returns no rows", async () => {
      ReportRequestStub.update.resolves([0, []]);

      const result = await updateReportRequestByIdList(["id99"], {
        status: "inactive",
      });

      expect(result).to.deep.equal([]);
    });

    it("should return list with one id if only one record updated", async () => {
      ReportRequestStub.update.resolves([1, [{ id: "id1" }]]);

      const result = await updateReportRequestByIdList(["id1"], {
        active: false,
      });

      expect(result).to.deep.equal(["id1"]);
    });

    it("should throw HttpServerError if model update fails", async () => {
      ReportRequestStub.update.rejects(new Error("update failed"));

      try {
        await updateReportRequestByIdList(["id1"], { name: "err" });
        throw new Error("Expected error");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenUpdatingReportRequestByIdList",
        );
        expect(err.details.message).to.equal("update failed");
      }
    });

    it("should call update with empty dataClause", async () => {
      await updateReportRequestByIdList(["id1"], {});
      sinon.assert.calledOnce(ReportRequestStub.update);
    });
  });
});
