const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getUserGroupMemberByQuery module", () => {
  let sandbox;
  let getUserGroupMemberByQuery;
  let UserGroupMemberStub;

  const fakeId = "uuid-123";
  const fakeRecord = {
    id: fakeId,
    name: "Test UserGroupMember",
    getData: () => ({ id: fakeId, name: "Test UserGroupMember" }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    UserGroupMemberStub = {
      findOne: sandbox.stub().resolves(fakeRecord),
    };

    getUserGroupMemberByQuery = proxyquire(
      "../../../../../src/db-layer/main/UserGroupMember/utils/getUserGroupMemberByQuery",
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

  describe("getUserGroupMemberByQuery", () => {
    it("should return the result of getData if found", async () => {
      const result = await getUserGroupMemberByQuery({ id: fakeId });

      expect(result).to.deep.equal({
        id: fakeId,
        name: "Test UserGroupMember",
      });
      sinon.assert.calledOnce(UserGroupMemberStub.findOne);
      sinon.assert.calledWith(UserGroupMemberStub.findOne, {
        where: {
          id: fakeId,
          isActive: true,
        },
      });
    });

    it("should return null if no record is found", async () => {
      UserGroupMemberStub.findOne.resolves(null);

      const result = await getUserGroupMemberByQuery({ id: fakeId });

      expect(result).to.be.null;
      sinon.assert.calledOnce(UserGroupMemberStub.findOne);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await getUserGroupMemberByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await getUserGroupMemberByQuery("invalid-query");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should wrap findOne errors in HttpServerError", async () => {
      UserGroupMemberStub.findOne.rejects(new Error("findOne failed"));

      try {
        await getUserGroupMemberByQuery({ test: true });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingUserGroupMemberByQuery",
        );
        expect(err.details.message).to.equal("findOne failed");
      }
    });

    it("should return undefined if getData returns undefined", async () => {
      UserGroupMemberStub.findOne.resolves({ getData: () => undefined });

      const result = await getUserGroupMemberByQuery({ id: fakeId });

      expect(result).to.be.undefined;
    });
  });
});
