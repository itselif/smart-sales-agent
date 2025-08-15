const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getAnomalyEventById module", () => {
  let sandbox;
  let getAnomalyEventById;
  let AnomalyEventStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test AnomalyEvent" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    AnomalyEventStub = {
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

    getAnomalyEventById = proxyquire(
      "../../../../../src/db-layer/main/AnomalyEvent/utils/getAnomalyEventById",
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

  describe("getAnomalyEventById", () => {
    it("should return getData() for single ID", async () => {
      const result = await getAnomalyEventById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(AnomalyEventStub.findOne);
      sinon.assert.calledWith(
        AnomalyEventStub.findOne,
        sinon.match.has("where", sinon.match.has("id", fakeId)),
      );
    });

    it("should return mapped getData() results for array of IDs", async () => {
      const result = await getAnomalyEventById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(AnomalyEventStub.findAll);
      sinon.assert.calledWithMatch(AnomalyEventStub.findAll, {
        where: { id: { [Op.in]: ["1", "2"] } },
      });
    });

    it("should return null if record not found (single ID)", async () => {
      AnomalyEventStub.findOne.resolves(null);
      const result = await getAnomalyEventById(fakeId);
      expect(result).to.be.null;
    });

    it("should return null if empty array returned from findAll", async () => {
      AnomalyEventStub.findAll.resolves([]);
      const result = await getAnomalyEventById(["a", "b"]);
      expect(result).to.deep.equal([]);
    });

    it("should wrap unexpected errors with HttpServerError (single ID)", async () => {
      AnomalyEventStub.findOne.rejects(new Error("DB failure"));
      try {
        await getAnomalyEventById("test");
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingAnomalyEventById",
        );
        expect(err.details.message).to.equal("DB failure");
      }
    });

    it("should wrap unexpected errors with HttpServerError (array of IDs)", async () => {
      AnomalyEventStub.findAll.rejects(new Error("array failure"));
      try {
        await getAnomalyEventById(["fail"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingAnomalyEventById",
        );
        expect(err.details.message).to.equal("array failure");
      }
    });

    it("should return undefined if getData() returns undefined", async () => {
      AnomalyEventStub.findOne.resolves({ getData: () => undefined });
      const result = await getAnomalyEventById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should return array of undefineds if getData() returns undefined per item", async () => {
      AnomalyEventStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getAnomalyEventById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });
  });
});
