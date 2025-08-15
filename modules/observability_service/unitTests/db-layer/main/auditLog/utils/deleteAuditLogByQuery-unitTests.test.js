const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("deleteAuditLogByQuery module", () => {
  let sandbox;
  let deleteAuditLogByQuery;
  let AuditLogStub;

  const fakeData = [
    { id: 1, name: "Item 1", getData: () => ({ id: 1, name: "Item 1" }) },
    { id: 2, name: "Item 2", getData: () => ({ id: 2, name: "Item 2" }) },
  ];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    AuditLogStub = {
      update: sandbox.stub().resolves([2, fakeData]),
    };

    deleteAuditLogByQuery = proxyquire(
      "../../../../../src/db-layer/main/AuditLog/utils/deleteAuditLogByQuery",
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

  describe("deleteAuditLogByQuery", () => {
    it("should soft-delete records matching query and return updated rows", async () => {
      const query = { clientId: "abc123" };
      const result = await deleteAuditLogByQuery(query);

      expect(result).to.deep.equal([
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
      ]);

      sinon.assert.calledOnce(AuditLogStub.update);
      sinon.assert.calledWith(
        AuditLogStub.update,
        { isActive: false },
        {
          where: { clientId: "abc123", isActive: true },
          returning: true,
        },
      );
    });

    it("should return empty array if no records were updated", async () => {
      AuditLogStub.update.resolves([0, []]);

      const query = { clientId: "no-match" };
      const result = await deleteAuditLogByQuery(query);

      expect(result).to.deep.equal([]);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await deleteAuditLogByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await deleteAuditLogByQuery("string");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should wrap model update() error in HttpServerError", async () => {
      AuditLogStub.update.rejects(new Error("update error"));

      try {
        await deleteAuditLogByQuery({ test: true });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenDeletingAuditLogByQuery",
        );
        expect(err.details.message).to.equal("update error");
      }
    });

    it("should still return mapped array even if getData returns undefined", async () => {
      const partial = [
        { getData: () => undefined },
        { getData: () => undefined },
      ];
      AuditLogStub.update.resolves([2, partial]);

      const result = await deleteAuditLogByQuery({ any: "field" });

      expect(result).to.deep.equal([undefined, undefined]);
    });
  });
});
