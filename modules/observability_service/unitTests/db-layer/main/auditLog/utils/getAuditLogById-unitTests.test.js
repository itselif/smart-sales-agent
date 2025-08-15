const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getAuditLogById module", () => {
  let sandbox;
  let getAuditLogById;
  let AuditLogStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test AuditLog" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    AuditLogStub = {
      findOne: sandbox.stub().resolves({
        getData: () => fakeData,
      }),
      findAll: sandbox
        .stub()
        .resolves([
          { getData: () => ({ id: "1", name: "Item 1" }) },
          { getData: () => ({ id: "2", name: "Item 2" }) },
        ]),
    };

    getAuditLogById = proxyquire(
      "../../../../../src/db-layer/main/AuditLog/utils/getAuditLogById",
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

  describe("getAuditLogById", () => {
    it("should return getData() for single ID", async () => {
      const result = await getAuditLogById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(AuditLogStub.findOne);
      sinon.assert.calledWith(
        AuditLogStub.findOne,
        sinon.match.has("where", sinon.match.has("id", fakeId)),
      );
    });

    it("should return mapped getData() results for array of IDs", async () => {
      const result = await getAuditLogById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(AuditLogStub.findAll);
      sinon.assert.calledWithMatch(AuditLogStub.findAll, {
        where: { id: { [Op.in]: ["1", "2"] } },
      });
    });

    it("should return null if record not found (single ID)", async () => {
      AuditLogStub.findOne.resolves(null);
      const result = await getAuditLogById(fakeId);
      expect(result).to.be.null;
    });

    it("should return null if empty array returned from findAll", async () => {
      AuditLogStub.findAll.resolves([]);
      const result = await getAuditLogById(["a", "b"]);
      expect(result).to.deep.equal([]);
    });

    it("should wrap unexpected errors with HttpServerError (single ID)", async () => {
      AuditLogStub.findOne.rejects(new Error("DB failure"));
      try {
        await getAuditLogById("test");
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingAuditLogById",
        );
        expect(err.details.message).to.equal("DB failure");
      }
    });

    it("should wrap unexpected errors with HttpServerError (array of IDs)", async () => {
      AuditLogStub.findAll.rejects(new Error("array failure"));
      try {
        await getAuditLogById(["fail"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingAuditLogById",
        );
        expect(err.details.message).to.equal("array failure");
      }
    });

    it("should return undefined if getData() returns undefined", async () => {
      AuditLogStub.findOne.resolves({ getData: () => undefined });
      const result = await getAuditLogById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should return array of undefineds if getData() returns undefined per item", async () => {
      AuditLogStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getAuditLogById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });
  });
});
