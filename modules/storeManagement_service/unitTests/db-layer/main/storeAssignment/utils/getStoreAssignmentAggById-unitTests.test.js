const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getStoreAssignmentAggById module", () => {
  let sandbox;
  let getStoreAssignmentAggById;
  let StoreAssignmentStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test StoreAssignment" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    StoreAssignmentStub = {
      findOne: sandbox.stub().resolves({ getData: () => fakeData }),
      findAll: sandbox
        .stub()
        .resolves([
          { getData: () => ({ id: "1", name: "Item 1" }) },
          { getData: () => ({ id: "2", name: "Item 2" }) },
        ]),
      getCqrsJoins: sandbox.stub().resolves(),
    };

    getStoreAssignmentAggById = proxyquire(
      "../../../../../src/db-layer/main/StoreAssignment/utils/getStoreAssignmentAggById",
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
        },
        sequelize: { Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getStoreAssignmentAggById", () => {
    it("should return getData() with includes for single ID", async () => {
      const result = await getStoreAssignmentAggById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(StoreAssignmentStub.findOne);
      sinon.assert.calledOnce(StoreAssignmentStub.getCqrsJoins);
    });

    it("should return mapped getData() for array of IDs", async () => {
      const result = await getStoreAssignmentAggById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(StoreAssignmentStub.findAll);
      sinon.assert.calledOnce(StoreAssignmentStub.getCqrsJoins);
    });

    it("should return null if not found for single ID", async () => {
      StoreAssignmentStub.findOne.resolves(null);
      const result = await getStoreAssignmentAggById(fakeId);
      expect(result).to.equal(null);
    });

    it("should return empty array if input is array but no results", async () => {
      StoreAssignmentStub.findAll.resolves([]);
      const result = await getStoreAssignmentAggById(["nope"]);
      expect(result).to.deep.equal([]);
    });

    it("should return undefined if getData returns undefined in array items", async () => {
      StoreAssignmentStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getStoreAssignmentAggById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });

    it("should return undefined if getData returns undefined in single ID", async () => {
      StoreAssignmentStub.findOne.resolves({ getData: () => undefined });
      const result = await getStoreAssignmentAggById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should throw HttpServerError on unexpected error (findOne)", async () => {
      StoreAssignmentStub.findOne.rejects(new Error("fail"));
      try {
        await getStoreAssignmentAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingStoreAssignmentAggById",
        );
        expect(err.details.message).to.equal("fail");
      }
    });

    it("should throw HttpServerError on unexpected error (findAll)", async () => {
      StoreAssignmentStub.findAll.rejects(new Error("all fail"));
      try {
        await getStoreAssignmentAggById(["1"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingStoreAssignmentAggById",
        );
        expect(err.details.message).to.equal("all fail");
      }
    });

    it("should throw HttpServerError if getCqrsJoins fails", async () => {
      StoreAssignmentStub.getCqrsJoins.rejects(new Error("joins fail"));
      try {
        await getStoreAssignmentAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingStoreAssignmentAggById",
        );
        expect(err.details.message).to.equal("joins fail");
      }
    });
  });
});
