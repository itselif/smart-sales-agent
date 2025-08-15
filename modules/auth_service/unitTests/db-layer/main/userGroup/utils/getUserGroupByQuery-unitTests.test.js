const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getUserGroupByQuery module", () => {
  let sandbox;
  let getUserGroupByQuery;
  let UserGroupStub;

  const fakeId = "uuid-123";
  const fakeRecord = {
    id: fakeId,
    name: "Test UserGroup",
    getData: () => ({ id: fakeId, name: "Test UserGroup" }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    UserGroupStub = {
      findOne: sandbox.stub().resolves(fakeRecord),
    };

    getUserGroupByQuery = proxyquire(
      "../../../../../src/db-layer/main/UserGroup/utils/getUserGroupByQuery",
      {
        models: { UserGroup: UserGroupStub },
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

  describe("getUserGroupByQuery", () => {
    it("should return the result of getData if found", async () => {
      const result = await getUserGroupByQuery({ id: fakeId });

      expect(result).to.deep.equal({ id: fakeId, name: "Test UserGroup" });
      sinon.assert.calledOnce(UserGroupStub.findOne);
      sinon.assert.calledWith(UserGroupStub.findOne, {
        where: {
          id: fakeId,
          isActive: true,
        },
      });
    });

    it("should return null if no record is found", async () => {
      UserGroupStub.findOne.resolves(null);

      const result = await getUserGroupByQuery({ id: fakeId });

      expect(result).to.be.null;
      sinon.assert.calledOnce(UserGroupStub.findOne);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await getUserGroupByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await getUserGroupByQuery("invalid-query");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should wrap findOne errors in HttpServerError", async () => {
      UserGroupStub.findOne.rejects(new Error("findOne failed"));

      try {
        await getUserGroupByQuery({ test: true });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingUserGroupByQuery",
        );
        expect(err.details.message).to.equal("findOne failed");
      }
    });

    it("should return undefined if getData returns undefined", async () => {
      UserGroupStub.findOne.resolves({ getData: () => undefined });

      const result = await getUserGroupByQuery({ id: fakeId });

      expect(result).to.be.undefined;
    });
  });
});
