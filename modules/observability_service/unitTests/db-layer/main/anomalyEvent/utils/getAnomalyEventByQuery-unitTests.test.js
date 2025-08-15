const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getAnomalyEventByQuery module", () => {
  let sandbox;
  let getAnomalyEventByQuery;
  let AnomalyEventStub;

  const fakeId = "uuid-123";
  const fakeRecord = {
    id: fakeId,
    name: "Test AnomalyEvent",
    getData: () => ({ id: fakeId, name: "Test AnomalyEvent" }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    AnomalyEventStub = {
      findOne: sandbox.stub().resolves(fakeRecord),
    };

    getAnomalyEventByQuery = proxyquire(
      "../../../../../src/db-layer/main/AnomalyEvent/utils/getAnomalyEventByQuery",
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
        },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getAnomalyEventByQuery", () => {
    it("should return the result of getData if found", async () => {
      const result = await getAnomalyEventByQuery({ id: fakeId });

      expect(result).to.deep.equal({ id: fakeId, name: "Test AnomalyEvent" });
      sinon.assert.calledOnce(AnomalyEventStub.findOne);
      sinon.assert.calledWith(AnomalyEventStub.findOne, {
        where: {
          id: fakeId,
          isActive: true,
        },
      });
    });

    it("should return null if no record is found", async () => {
      AnomalyEventStub.findOne.resolves(null);

      const result = await getAnomalyEventByQuery({ id: fakeId });

      expect(result).to.be.null;
      sinon.assert.calledOnce(AnomalyEventStub.findOne);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await getAnomalyEventByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await getAnomalyEventByQuery("invalid-query");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should wrap findOne errors in HttpServerError", async () => {
      AnomalyEventStub.findOne.rejects(new Error("findOne failed"));

      try {
        await getAnomalyEventByQuery({ test: true });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingAnomalyEventByQuery",
        );
        expect(err.details.message).to.equal("findOne failed");
      }
    });

    it("should return undefined if getData returns undefined", async () => {
      AnomalyEventStub.findOne.resolves({ getData: () => undefined });

      const result = await getAnomalyEventByQuery({ id: fakeId });

      expect(result).to.be.undefined;
    });
  });
});
