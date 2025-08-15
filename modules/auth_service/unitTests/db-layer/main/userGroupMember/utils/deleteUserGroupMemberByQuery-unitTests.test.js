const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("deleteUserGroupMemberByQuery module", () => {
  let sandbox;
  let deleteUserGroupMemberByQuery;
  let UserGroupMemberStub;

  const fakeData = [
    { id: 1, name: "Item 1", getData: () => ({ id: 1, name: "Item 1" }) },
    { id: 2, name: "Item 2", getData: () => ({ id: 2, name: "Item 2" }) },
  ];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    UserGroupMemberStub = {
      update: sandbox.stub().resolves([2, fakeData]),
    };

    deleteUserGroupMemberByQuery = proxyquire(
      "../../../../../src/db-layer/main/UserGroupMember/utils/deleteUserGroupMemberByQuery",
      {
        models: { UserGroupMember: UserGroupMemberStub },
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

  describe("deleteUserGroupMemberByQuery", () => {
    it("should soft-delete records matching query and return updated rows", async () => {
      const query = { clientId: "abc123" };
      const result = await deleteUserGroupMemberByQuery(query);

      expect(result).to.deep.equal([
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
      ]);

      sinon.assert.calledOnce(UserGroupMemberStub.update);
      sinon.assert.calledWith(
        UserGroupMemberStub.update,
        { isActive: false },
        {
          where: { clientId: "abc123", isActive: true },
          returning: true,
        },
      );
    });

    it("should return empty array if no records were updated", async () => {
      UserGroupMemberStub.update.resolves([0, []]);

      const query = { clientId: "no-match" };
      const result = await deleteUserGroupMemberByQuery(query);

      expect(result).to.deep.equal([]);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await deleteUserGroupMemberByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await deleteUserGroupMemberByQuery("string");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should wrap model update() error in HttpServerError", async () => {
      UserGroupMemberStub.update.rejects(new Error("update error"));

      try {
        await deleteUserGroupMemberByQuery({ test: true });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenDeletingUserGroupMemberByQuery",
        );
        expect(err.details.message).to.equal("update error");
      }
    });

    it("should still return mapped array even if getData returns undefined", async () => {
      const partial = [
        { getData: () => undefined },
        { getData: () => undefined },
      ];
      UserGroupMemberStub.update.resolves([2, partial]);

      const result = await deleteUserGroupMemberByQuery({ any: "field" });

      expect(result).to.deep.equal([undefined, undefined]);
    });
  });
});
