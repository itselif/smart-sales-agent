const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getAnomalyEventAggById module", () => {
  let sandbox;
  let getAnomalyEventAggById;
  let AnomalyEventStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test AnomalyEvent" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    AnomalyEventStub = {
      findOne: sandbox.stub().resolves({ getData: () => fakeData }),
      findAll: sandbox
        .stub()
        .resolves([
          { getData: () => ({ id: "1", name: "Item 1" }) },
          { getData: () => ({ id: "2", name: "Item 2" }) },
        ]),
      getCqrsJoins: sandbox.stub().resolves(),
    };

    getAnomalyEventAggById = proxyquire(
      "../../../../../src/db-layer/main/AnomalyEvent/utils/getAnomalyEventAggById",
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
        },
        sequelize: { Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getAnomalyEventAggById", () => {
    it("should return getData() with includes for single ID", async () => {
      const result = await getAnomalyEventAggById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(AnomalyEventStub.findOne);
      sinon.assert.calledOnce(AnomalyEventStub.getCqrsJoins);
    });

    it("should return mapped getData() for array of IDs", async () => {
      const result = await getAnomalyEventAggById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(AnomalyEventStub.findAll);
      sinon.assert.calledOnce(AnomalyEventStub.getCqrsJoins);
    });

    it("should return null if not found for single ID", async () => {
      AnomalyEventStub.findOne.resolves(null);
      const result = await getAnomalyEventAggById(fakeId);
      expect(result).to.equal(null);
    });

    it("should return empty array if input is array but no results", async () => {
      AnomalyEventStub.findAll.resolves([]);
      const result = await getAnomalyEventAggById(["nope"]);
      expect(result).to.deep.equal([]);
    });

    it("should return undefined if getData returns undefined in array items", async () => {
      AnomalyEventStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getAnomalyEventAggById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });

    it("should return undefined if getData returns undefined in single ID", async () => {
      AnomalyEventStub.findOne.resolves({ getData: () => undefined });
      const result = await getAnomalyEventAggById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should throw HttpServerError on unexpected error (findOne)", async () => {
      AnomalyEventStub.findOne.rejects(new Error("fail"));
      try {
        await getAnomalyEventAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingAnomalyEventAggById",
        );
        expect(err.details.message).to.equal("fail");
      }
    });

    it("should throw HttpServerError on unexpected error (findAll)", async () => {
      AnomalyEventStub.findAll.rejects(new Error("all fail"));
      try {
        await getAnomalyEventAggById(["1"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingAnomalyEventAggById",
        );
        expect(err.details.message).to.equal("all fail");
      }
    });

    it("should throw HttpServerError if getCqrsJoins fails", async () => {
      AnomalyEventStub.getCqrsJoins.rejects(new Error("joins fail"));
      try {
        await getAnomalyEventAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingAnomalyEventAggById",
        );
        expect(err.details.message).to.equal("joins fail");
      }
    });
  });
});
