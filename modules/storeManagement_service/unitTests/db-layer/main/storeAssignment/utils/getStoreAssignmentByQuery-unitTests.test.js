const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getStoreAssignmentByQuery module", () => {
  let sandbox;
  let getStoreAssignmentByQuery;
  let StoreAssignmentStub;

  const fakeId = "uuid-123";
  const fakeRecord = {
    id: fakeId,
    name: "Test StoreAssignment",
    getData: () => ({ id: fakeId, name: "Test StoreAssignment" }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    StoreAssignmentStub = {
      findOne: sandbox.stub().resolves(fakeRecord),
    };

    getStoreAssignmentByQuery = proxyquire(
      "../../../../../src/db-layer/main/StoreAssignment/utils/getStoreAssignmentByQuery",
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

  describe("getStoreAssignmentByQuery", () => {
    it("should return the result of getData if found", async () => {
      const result = await getStoreAssignmentByQuery({ id: fakeId });

      expect(result).to.deep.equal({
        id: fakeId,
        name: "Test StoreAssignment",
      });
      sinon.assert.calledOnce(StoreAssignmentStub.findOne);
      sinon.assert.calledWith(StoreAssignmentStub.findOne, {
        where: {
          id: fakeId,
          isActive: true,
        },
      });
    });

    it("should return null if no record is found", async () => {
      StoreAssignmentStub.findOne.resolves(null);

      const result = await getStoreAssignmentByQuery({ id: fakeId });

      expect(result).to.be.null;
      sinon.assert.calledOnce(StoreAssignmentStub.findOne);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await getStoreAssignmentByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await getStoreAssignmentByQuery("invalid-query");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should wrap findOne errors in HttpServerError", async () => {
      StoreAssignmentStub.findOne.rejects(new Error("findOne failed"));

      try {
        await getStoreAssignmentByQuery({ test: true });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingStoreAssignmentByQuery",
        );
        expect(err.details.message).to.equal("findOne failed");
      }
    });

    it("should return undefined if getData returns undefined", async () => {
      StoreAssignmentStub.findOne.resolves({ getData: () => undefined });

      const result = await getStoreAssignmentByQuery({ id: fakeId });

      expect(result).to.be.undefined;
    });
  });
});
