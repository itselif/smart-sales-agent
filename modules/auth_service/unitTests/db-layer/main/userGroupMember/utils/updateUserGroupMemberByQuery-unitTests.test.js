const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("updateUserGroupMemberByQuery module", () => {
  let sandbox;
  let updateUserGroupMemberByQuery;
  let UserGroupMemberStub;

  const fakeQuery = { clientId: "abc123" };
  const fakeDataClause = { status: "archived" };
  const fakeUpdatedRows = [
    { getData: () => ({ id: "1", status: "archived" }) },
    { getData: () => ({ id: "2", status: "archived" }) },
  ];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    UserGroupMemberStub = {
      update: sandbox.stub().resolves([2, fakeUpdatedRows]),
    };

    updateUserGroupMemberByQuery = proxyquire(
      "../../../../../src/db-layer/main/UserGroupMember/utils/updateUserGroupMemberByQuery",
      {
        models: { UserGroupMember: UserGroupMemberStub },
        common: {
          HttpServerError: class HttpServerError extends Error {
            constructor(message, details) {
              super(message);
              this.name = "HttpServerError";
              this.details = details;
            }
          },
          BadRequestError: class BadRequestError extends Error {
            constructor(message) {
              super(message);
              this.name = "BadRequestError";
            }
          },
        },
        sequelize: { Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("updateUserGroupMemberByQuery", () => {
    it("should update records matching query and return getData list", async () => {
      const result = await updateUserGroupMemberByQuery(
        fakeDataClause,
        fakeQuery,
      );
      expect(result).to.deep.equal([
        { id: "1", status: "archived" },
        { id: "2", status: "archived" },
      ]);

      sinon.assert.calledOnce(UserGroupMemberStub.update);

      const [calledDataClause, calledOptions] =
        UserGroupMemberStub.update.firstCall.args;

      expect(calledDataClause).to.deep.equal(fakeDataClause);
      expect(calledOptions.returning).to.be.true;

      expect(calledOptions.where).to.deep.equal({
        query: fakeQuery,
        isActive: true,
      });
    });

    it("should return [] if update returns no matching rows", async () => {
      UserGroupMemberStub.update.resolves([0, []]);

      const result = await updateUserGroupMemberByQuery(
        fakeDataClause,
        fakeQuery,
      );
      expect(result).to.deep.equal([]);
    });

    it("should return list of undefineds if getData() returns undefined", async () => {
      UserGroupMemberStub.update.resolves([
        2,
        [{ getData: () => undefined }, { getData: () => undefined }],
      ]);

      const result = await updateUserGroupMemberByQuery(
        fakeDataClause,
        fakeQuery,
      );
      expect(result).to.deep.equal([undefined, undefined]);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await updateUserGroupMemberByQuery(fakeDataClause, undefined);
        throw new Error("Expected error");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await updateUserGroupMemberByQuery(fakeDataClause, "not-an-object");
        throw new Error("Expected error");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw HttpServerError if model update fails", async () => {
      UserGroupMemberStub.update.rejects(new Error("update failed"));

      try {
        await updateUserGroupMemberByQuery(fakeDataClause, fakeQuery);
        throw new Error("Expected error");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenUpdatingUserGroupMemberByQuery",
        );
        expect(err.details.message).to.equal("update failed");
      }
    });

    it("should accept empty dataClause and still process", async () => {
      UserGroupMemberStub.update.resolves([0, []]);

      const result = await updateUserGroupMemberByQuery({}, fakeQuery);
      expect(result).to.deep.equal([]);
    });
  });
});
