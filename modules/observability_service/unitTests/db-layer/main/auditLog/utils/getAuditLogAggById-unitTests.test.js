const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getAuditLogAggById module", () => {
  let sandbox;
  let getAuditLogAggById;
  let AuditLogStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test AuditLog" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    AuditLogStub = {
      findOne: sandbox.stub().resolves({ getData: () => fakeData }),
      findAll: sandbox
        .stub()
        .resolves([
          { getData: () => ({ id: "1", name: "Item 1" }) },
          { getData: () => ({ id: "2", name: "Item 2" }) },
        ]),
      getCqrsJoins: sandbox.stub().resolves(),
    };

    getAuditLogAggById = proxyquire(
      "../../../../../src/db-layer/main/AuditLog/utils/getAuditLogAggById",
      {
        models: { AuditLog: AuditLogStub },
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

  describe("getAuditLogAggById", () => {
    it("should return getData() with includes for single ID", async () => {
      const result = await getAuditLogAggById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(AuditLogStub.findOne);
      sinon.assert.calledOnce(AuditLogStub.getCqrsJoins);
    });

    it("should return mapped getData() for array of IDs", async () => {
      const result = await getAuditLogAggById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(AuditLogStub.findAll);
      sinon.assert.calledOnce(AuditLogStub.getCqrsJoins);
    });

    it("should return null if not found for single ID", async () => {
      AuditLogStub.findOne.resolves(null);
      const result = await getAuditLogAggById(fakeId);
      expect(result).to.equal(null);
    });

    it("should return empty array if input is array but no results", async () => {
      AuditLogStub.findAll.resolves([]);
      const result = await getAuditLogAggById(["nope"]);
      expect(result).to.deep.equal([]);
    });

    it("should return undefined if getData returns undefined in array items", async () => {
      AuditLogStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getAuditLogAggById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });

    it("should return undefined if getData returns undefined in single ID", async () => {
      AuditLogStub.findOne.resolves({ getData: () => undefined });
      const result = await getAuditLogAggById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should throw HttpServerError on unexpected error (findOne)", async () => {
      AuditLogStub.findOne.rejects(new Error("fail"));
      try {
        await getAuditLogAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingAuditLogAggById",
        );
        expect(err.details.message).to.equal("fail");
      }
    });

    it("should throw HttpServerError on unexpected error (findAll)", async () => {
      AuditLogStub.findAll.rejects(new Error("all fail"));
      try {
        await getAuditLogAggById(["1"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingAuditLogAggById",
        );
        expect(err.details.message).to.equal("all fail");
      }
    });

    it("should throw HttpServerError if getCqrsJoins fails", async () => {
      AuditLogStub.getCqrsJoins.rejects(new Error("joins fail"));
      try {
        await getAuditLogAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingAuditLogAggById",
        );
        expect(err.details.message).to.equal("joins fail");
      }
    });
  });
});
