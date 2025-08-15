const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getLowStockAlertListByQuery module", () => {
  let sandbox;
  let getLowStockAlertListByQuery;
  let LowStockAlertStub;

  const fakeList = [
    { getData: () => ({ id: "1", name: "Item 1" }) },
    { getData: () => ({ id: "2", name: "Item 2" }) },
  ];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    LowStockAlertStub = {
      findAll: sandbox.stub().resolves(fakeList),
    };

    getLowStockAlertListByQuery = proxyquire(
      "../../../../../src/db-layer/main/LowStockAlert/utils/getLowStockAlertListByQuery",
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

  describe("getLowStockAlertListByQuery", () => {
    it("should return list of getData() results if query is valid", async () => {
      const result = await getLowStockAlertListByQuery({ isActive: true });

      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);

      sinon.assert.calledOnce(LowStockAlertStub.findAll);
      sinon.assert.calledWithMatch(LowStockAlertStub.findAll, {
        where: { isActive: true },
      });
    });

    it("should return [] if findAll returns null", async () => {
      LowStockAlertStub.findAll.resolves(null);

      const result = await getLowStockAlertListByQuery({ active: false });
      expect(result).to.deep.equal([]);
    });

    it("should return [] if findAll returns empty array", async () => {
      LowStockAlertStub.findAll.resolves([]);

      const result = await getLowStockAlertListByQuery({ clientId: "xyz" });
      expect(result).to.deep.equal([]);
    });

    it("should return list of undefineds if getData() returns undefined", async () => {
      LowStockAlertStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);

      const result = await getLowStockAlertListByQuery({ active: true });
      expect(result).to.deep.equal([undefined, undefined]);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await getLowStockAlertListByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await getLowStockAlertListByQuery("not-an-object");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw HttpServerError if findAll fails", async () => {
      LowStockAlertStub.findAll.rejects(new Error("findAll failed"));

      try {
        await getLowStockAlertListByQuery({ some: "query" });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingLowStockAlertListByQuery",
        );
        expect(err.details.message).to.equal("findAll failed");
      }
    });
  });
});
