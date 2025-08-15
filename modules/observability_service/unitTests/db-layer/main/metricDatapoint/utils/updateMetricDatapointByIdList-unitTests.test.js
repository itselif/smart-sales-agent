const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("updateMetricDatapointByIdList module", () => {
  let sandbox;
  let updateMetricDatapointByIdList;
  let MetricDatapointStub;

  const fakeIdList = ["id1", "id2"];
  const fakeUpdatedRows = [
    { id: "id1", name: "Updated 1" },
    { id: "id2", name: "Updated 2" },
  ];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    MetricDatapointStub = {
      update: sandbox.stub().resolves([2, fakeUpdatedRows]),
    };

    updateMetricDatapointByIdList = proxyquire(
      "../../../../../src/db-layer/main/MetricDatapoint/utils/updateMetricDatapointByIdList",
      {
        models: { MetricDatapoint: MetricDatapointStub },
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

  describe("updateMetricDatapointByIdList", () => {
    it("should return list of updated IDs if update is successful", async () => {
      const result = await updateMetricDatapointByIdList(fakeIdList, {
        name: "Updated",
      });

      expect(result).to.deep.equal(["id1", "id2"]);
      sinon.assert.calledOnce(MetricDatapointStub.update);
      const args = MetricDatapointStub.update.getCall(0).args;
      expect(args[0]).to.deep.equal({ name: "Updated" });
      expect(args[1]).to.deep.equal({
        where: { id: { [Op.in]: fakeIdList }, isActive: true },
        returning: true,
      });
    });

    it("should return empty list if update returns no rows", async () => {
      MetricDatapointStub.update.resolves([0, []]);

      const result = await updateMetricDatapointByIdList(["id99"], {
        status: "inactive",
      });

      expect(result).to.deep.equal([]);
    });

    it("should return list with one id if only one record updated", async () => {
      MetricDatapointStub.update.resolves([1, [{ id: "id1" }]]);

      const result = await updateMetricDatapointByIdList(["id1"], {
        active: false,
      });

      expect(result).to.deep.equal(["id1"]);
    });

    it("should throw HttpServerError if model update fails", async () => {
      MetricDatapointStub.update.rejects(new Error("update failed"));

      try {
        await updateMetricDatapointByIdList(["id1"], { name: "err" });
        throw new Error("Expected error");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenUpdatingMetricDatapointByIdList",
        );
        expect(err.details.message).to.equal("update failed");
      }
    });

    it("should call update with empty dataClause", async () => {
      await updateMetricDatapointByIdList(["id1"], {});
      sinon.assert.calledOnce(MetricDatapointStub.update);
    });
  });
});
