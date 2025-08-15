const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getAuditLogByStoreId module", () => {
  let sandbox;
  let getAuditLogByStoreId;
  let AuditLogStub;

  const mockData = { id: "123", name: "Test AuditLog" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    AuditLogStub = {
      findOne: sandbox.stub().resolves({
        getData: () => mockData,
      }),
    };

    getAuditLogByStoreId = proxyquire(
      "../../../../../src/db-layer/main/AuditLog/utils/getAuditLogByStoreId",
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
        sequelize: { Op: require("sequelize").Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getAuditLogByStoreId", () => {
    it("should return getData() if auditLog is found", async () => {
      const result = await getAuditLogByStoreId("some-key");
      expect(result).to.deep.equal(mockData);
      sinon.assert.calledOnce(AuditLogStub.findOne);
      sinon.assert.calledWithMatch(AuditLogStub.findOne, {
        where: { storeId: "some-key" },
      });
    });

    it("should return null if auditLog is not found", async () => {
      AuditLogStub.findOne.resolves(null);
      const result = await getAuditLogByStoreId("missing-key");
      expect(result).to.equal(null);
    });

    it("should return undefined if getData returns undefined", async () => {
      AuditLogStub.findOne.resolves({ getData: () => undefined });
      const result = await getAuditLogByStoreId("key");
      expect(result).to.be.undefined;
    });

    it("should throw HttpServerError if findOne throws", async () => {
      AuditLogStub.findOne.rejects(new Error("db failure"));

      try {
        await getAuditLogByStoreId("key");
        throw new Error("Expected to throw");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingAuditLogByStoreId",
        );
        expect(err.details.message).to.equal("db failure");
      }
    });
  });
});
