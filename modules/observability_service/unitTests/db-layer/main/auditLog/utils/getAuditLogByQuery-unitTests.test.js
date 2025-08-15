const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getAuditLogByQuery module", () => {
  let sandbox;
  let getAuditLogByQuery;
  let AuditLogStub;

  const fakeId = "uuid-123";
  const fakeRecord = {
    id: fakeId,
    name: "Test AuditLog",
    getData: () => ({ id: fakeId, name: "Test AuditLog" }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    AuditLogStub = {
      findOne: sandbox.stub().resolves(fakeRecord),
    };

    getAuditLogByQuery = proxyquire(
      "../../../../../src/db-layer/main/AuditLog/utils/getAuditLogByQuery",
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

  describe("getAuditLogByQuery", () => {
    it("should return the result of getData if found", async () => {
      const result = await getAuditLogByQuery({ id: fakeId });

      expect(result).to.deep.equal({ id: fakeId, name: "Test AuditLog" });
      sinon.assert.calledOnce(AuditLogStub.findOne);
      sinon.assert.calledWith(AuditLogStub.findOne, {
        where: {
          id: fakeId,
          isActive: true,
        },
      });
    });

    it("should return null if no record is found", async () => {
      AuditLogStub.findOne.resolves(null);

      const result = await getAuditLogByQuery({ id: fakeId });

      expect(result).to.be.null;
      sinon.assert.calledOnce(AuditLogStub.findOne);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await getAuditLogByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await getAuditLogByQuery("invalid-query");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should wrap findOne errors in HttpServerError", async () => {
      AuditLogStub.findOne.rejects(new Error("findOne failed"));

      try {
        await getAuditLogByQuery({ test: true });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingAuditLogByQuery",
        );
        expect(err.details.message).to.equal("findOne failed");
      }
    });

    it("should return undefined if getData returns undefined", async () => {
      AuditLogStub.findOne.resolves({ getData: () => undefined });

      const result = await getAuditLogByQuery({ id: fakeId });

      expect(result).to.be.undefined;
    });
  });
});
