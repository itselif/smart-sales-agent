const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getMetricDatapointById module", () => {
  let sandbox;
  let getMetricDatapointById;
  let MetricDatapointStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test MetricDatapoint" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    MetricDatapointStub = {
      findOne: sandbox.stub().resolves({
        getData: () => fakeData,
      }),
      findAll: sandbox
        .stub()
        .resolves([
          { getData: () => ({ id: "1", name: "Item 1" }) },
          { getData: () => ({ id: "2", name: "Item 2" }) },
        ]),
    };

    getMetricDatapointById = proxyquire(
      "../../../../../src/db-layer/main/MetricDatapoint/utils/getMetricDatapointById",
      {
        models: { MetricDatapoint: MetricDatapointStub },
        common: {
          HttpServerError: class HttpServerError extends Error {
            constructor(msg, details) {
              super(msg);
              this.name = "HttpServerError";
              this.details = details;
            }
          },
        },
        sequelize: { Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getMetricDatapointById", () => {
    it("should return getData() for single ID", async () => {
      const result = await getMetricDatapointById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(MetricDatapointStub.findOne);
      sinon.assert.calledWith(
        MetricDatapointStub.findOne,
        sinon.match.has("where", sinon.match.has("id", fakeId)),
      );
    });

    it("should return mapped getData() results for array of IDs", async () => {
      const result = await getMetricDatapointById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(MetricDatapointStub.findAll);
      sinon.assert.calledWithMatch(MetricDatapointStub.findAll, {
        where: { id: { [Op.in]: ["1", "2"] } },
      });
    });

    it("should return null if record not found (single ID)", async () => {
      MetricDatapointStub.findOne.resolves(null);
      const result = await getMetricDatapointById(fakeId);
      expect(result).to.be.null;
    });

    it("should return null if empty array returned from findAll", async () => {
      MetricDatapointStub.findAll.resolves([]);
      const result = await getMetricDatapointById(["a", "b"]);
      expect(result).to.deep.equal([]);
    });

    it("should wrap unexpected errors with HttpServerError (single ID)", async () => {
      MetricDatapointStub.findOne.rejects(new Error("DB failure"));
      try {
        await getMetricDatapointById("test");
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingMetricDatapointById",
        );
        expect(err.details.message).to.equal("DB failure");
      }
    });

    it("should wrap unexpected errors with HttpServerError (array of IDs)", async () => {
      MetricDatapointStub.findAll.rejects(new Error("array failure"));
      try {
        await getMetricDatapointById(["fail"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingMetricDatapointById",
        );
        expect(err.details.message).to.equal("array failure");
      }
    });

    it("should return undefined if getData() returns undefined", async () => {
      MetricDatapointStub.findOne.resolves({ getData: () => undefined });
      const result = await getMetricDatapointById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should return array of undefineds if getData() returns undefined per item", async () => {
      MetricDatapointStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getMetricDatapointById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });
  });
});
