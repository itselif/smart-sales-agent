const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getUserGroupMemberListByQuery module", () => {
  let sandbox;
  let getUserGroupMemberListByQuery;
  let UserGroupMemberStub;

  const fakeList = [
    { getData: () => ({ id: "1", name: "Item 1" }) },
    { getData: () => ({ id: "2", name: "Item 2" }) },
  ];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    UserGroupMemberStub = {
      findAll: sandbox.stub().resolves(fakeList),
    };

    getUserGroupMemberListByQuery = proxyquire(
      "../../../../../src/db-layer/main/UserGroupMember/utils/getUserGroupMemberListByQuery",
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

  describe("getUserGroupMemberListByQuery", () => {
    it("should return list of getData() results if query is valid", async () => {
      const result = await getUserGroupMemberListByQuery({ isActive: true });

      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);

      sinon.assert.calledOnce(UserGroupMemberStub.findAll);
      sinon.assert.calledWithMatch(UserGroupMemberStub.findAll, {
        where: { isActive: true },
      });
    });

    it("should return [] if findAll returns null", async () => {
      UserGroupMemberStub.findAll.resolves(null);

      const result = await getUserGroupMemberListByQuery({ active: false });
      expect(result).to.deep.equal([]);
    });

    it("should return [] if findAll returns empty array", async () => {
      UserGroupMemberStub.findAll.resolves([]);

      const result = await getUserGroupMemberListByQuery({ clientId: "xyz" });
      expect(result).to.deep.equal([]);
    });

    it("should return list of undefineds if getData() returns undefined", async () => {
      UserGroupMemberStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);

      const result = await getUserGroupMemberListByQuery({ active: true });
      expect(result).to.deep.equal([undefined, undefined]);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await getUserGroupMemberListByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await getUserGroupMemberListByQuery("not-an-object");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw HttpServerError if findAll fails", async () => {
      UserGroupMemberStub.findAll.rejects(new Error("findAll failed"));

      try {
        await getUserGroupMemberListByQuery({ some: "query" });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingUserGroupMemberListByQuery",
        );
        expect(err.details.message).to.equal("findAll failed");
      }
    });
  });
});
