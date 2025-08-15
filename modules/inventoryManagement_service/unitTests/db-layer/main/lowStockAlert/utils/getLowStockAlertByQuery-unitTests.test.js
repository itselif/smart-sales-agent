const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getLowStockAlertByQuery module", () => {
  let sandbox;
  let getLowStockAlertByQuery;
  let LowStockAlertStub;

  const fakeId = "uuid-123";
  const fakeRecord = {
    id: fakeId,
    name: "Test LowStockAlert",
    getData: () => ({ id: fakeId, name: "Test LowStockAlert" }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    LowStockAlertStub = {
      findOne: sandbox.stub().resolves(fakeRecord),
    };

    getLowStockAlertByQuery = proxyquire(
      "../../../../../src/db-layer/main/LowStockAlert/utils/getLowStockAlertByQuery",
      {
        models: { LowStockAlert: LowStockAlertStub },
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

  describe("getLowStockAlertByQuery", () => {
    it("should return the result of getData if found", async () => {
      const result = await getLowStockAlertByQuery({ id: fakeId });

      expect(result).to.deep.equal({ id: fakeId, name: "Test LowStockAlert" });
      sinon.assert.calledOnce(LowStockAlertStub.findOne);
      sinon.assert.calledWith(LowStockAlertStub.findOne, {
        where: {
          id: fakeId,
          isActive: true,
        },
      });
    });

    it("should return null if no record is found", async () => {
      LowStockAlertStub.findOne.resolves(null);

      const result = await getLowStockAlertByQuery({ id: fakeId });

      expect(result).to.be.null;
      sinon.assert.calledOnce(LowStockAlertStub.findOne);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await getLowStockAlertByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await getLowStockAlertByQuery("invalid-query");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should wrap findOne errors in HttpServerError", async () => {
      LowStockAlertStub.findOne.rejects(new Error("findOne failed"));

      try {
        await getLowStockAlertByQuery({ test: true });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingLowStockAlertByQuery",
        );
        expect(err.details.message).to.equal("findOne failed");
      }
    });

    it("should return undefined if getData returns undefined", async () => {
      LowStockAlertStub.findOne.resolves({ getData: () => undefined });

      const result = await getLowStockAlertByQuery({ id: fakeId });

      expect(result).to.be.undefined;
    });
  });
});
