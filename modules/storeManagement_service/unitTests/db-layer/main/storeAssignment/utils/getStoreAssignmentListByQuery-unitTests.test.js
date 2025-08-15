const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getStoreAssignmentListByQuery module", () => {
  let sandbox;
  let getStoreAssignmentListByQuery;
  let StoreAssignmentStub;

  const fakeList = [
    { getData: () => ({ id: "1", name: "Item 1" }) },
    { getData: () => ({ id: "2", name: "Item 2" }) },
  ];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    StoreAssignmentStub = {
      findAll: sandbox.stub().resolves(fakeList),
    };

    getStoreAssignmentListByQuery = proxyquire(
      "../../../../../src/db-layer/main/StoreAssignment/utils/getStoreAssignmentListByQuery",
      {
        models: { StoreAssignment: StoreAssignmentStub },
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

  describe("getStoreAssignmentListByQuery", () => {
    it("should return list of getData() results if query is valid", async () => {
      const result = await getStoreAssignmentListByQuery({ isActive: true });

      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);

      sinon.assert.calledOnce(StoreAssignmentStub.findAll);
      sinon.assert.calledWithMatch(StoreAssignmentStub.findAll, {
        where: { isActive: true },
      });
    });

    it("should return [] if findAll returns null", async () => {
      StoreAssignmentStub.findAll.resolves(null);

      const result = await getStoreAssignmentListByQuery({ active: false });
      expect(result).to.deep.equal([]);
    });

    it("should return [] if findAll returns empty array", async () => {
      StoreAssignmentStub.findAll.resolves([]);

      const result = await getStoreAssignmentListByQuery({ clientId: "xyz" });
      expect(result).to.deep.equal([]);
    });

    it("should return list of undefineds if getData() returns undefined", async () => {
      StoreAssignmentStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);

      const result = await getStoreAssignmentListByQuery({ active: true });
      expect(result).to.deep.equal([undefined, undefined]);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await getStoreAssignmentListByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await getStoreAssignmentListByQuery("not-an-object");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw HttpServerError if findAll fails", async () => {
      StoreAssignmentStub.findAll.rejects(new Error("findAll failed"));

      try {
        await getStoreAssignmentListByQuery({ some: "query" });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingStoreAssignmentListByQuery",
        );
        expect(err.details.message).to.equal("findAll failed");
      }
    });
  });
});
