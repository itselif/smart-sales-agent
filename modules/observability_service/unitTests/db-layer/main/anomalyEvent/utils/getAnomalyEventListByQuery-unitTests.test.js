const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getAnomalyEventListByQuery module", () => {
  let sandbox;
  let getAnomalyEventListByQuery;
  let AnomalyEventStub;

  const fakeList = [
    { getData: () => ({ id: "1", name: "Item 1" }) },
    { getData: () => ({ id: "2", name: "Item 2" }) },
  ];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    AnomalyEventStub = {
      findAll: sandbox.stub().resolves(fakeList),
    };

    getAnomalyEventListByQuery = proxyquire(
      "../../../../../src/db-layer/main/AnomalyEvent/utils/getAnomalyEventListByQuery",
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

  describe("getAnomalyEventListByQuery", () => {
    it("should return list of getData() results if query is valid", async () => {
      const result = await getAnomalyEventListByQuery({ isActive: true });

      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);

      sinon.assert.calledOnce(AnomalyEventStub.findAll);
      sinon.assert.calledWithMatch(AnomalyEventStub.findAll, {
        where: { isActive: true },
      });
    });

    it("should return [] if findAll returns null", async () => {
      AnomalyEventStub.findAll.resolves(null);

      const result = await getAnomalyEventListByQuery({ active: false });
      expect(result).to.deep.equal([]);
    });

    it("should return [] if findAll returns empty array", async () => {
      AnomalyEventStub.findAll.resolves([]);

      const result = await getAnomalyEventListByQuery({ clientId: "xyz" });
      expect(result).to.deep.equal([]);
    });

    it("should return list of undefineds if getData() returns undefined", async () => {
      AnomalyEventStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);

      const result = await getAnomalyEventListByQuery({ active: true });
      expect(result).to.deep.equal([undefined, undefined]);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await getAnomalyEventListByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await getAnomalyEventListByQuery("not-an-object");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw HttpServerError if findAll fails", async () => {
      AnomalyEventStub.findAll.rejects(new Error("findAll failed"));

      try {
        await getAnomalyEventListByQuery({ some: "query" });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingAnomalyEventListByQuery",
        );
        expect(err.details.message).to.equal("findAll failed");
      }
    });
  });
});
