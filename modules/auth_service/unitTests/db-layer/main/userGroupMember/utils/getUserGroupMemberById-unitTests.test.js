const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getUserGroupMemberById module", () => {
  let sandbox;
  let getUserGroupMemberById;
  let UserGroupMemberStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test UserGroupMember" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    UserGroupMemberStub = {
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

    getUserGroupMemberById = proxyquire(
      "../../../../../src/db-layer/main/UserGroupMember/utils/getUserGroupMemberById",
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
        },
        sequelize: { Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getUserGroupMemberById", () => {
    it("should return getData() for single ID", async () => {
      const result = await getUserGroupMemberById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(UserGroupMemberStub.findOne);
      sinon.assert.calledWith(
        UserGroupMemberStub.findOne,
        sinon.match.has("where", sinon.match.has("id", fakeId)),
      );
    });

    it("should return mapped getData() results for array of IDs", async () => {
      const result = await getUserGroupMemberById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(UserGroupMemberStub.findAll);
      sinon.assert.calledWithMatch(UserGroupMemberStub.findAll, {
        where: { id: { [Op.in]: ["1", "2"] } },
      });
    });

    it("should return null if record not found (single ID)", async () => {
      UserGroupMemberStub.findOne.resolves(null);
      const result = await getUserGroupMemberById(fakeId);
      expect(result).to.be.null;
    });

    it("should return null if empty array returned from findAll", async () => {
      UserGroupMemberStub.findAll.resolves([]);
      const result = await getUserGroupMemberById(["a", "b"]);
      expect(result).to.deep.equal([]);
    });

    it("should wrap unexpected errors with HttpServerError (single ID)", async () => {
      UserGroupMemberStub.findOne.rejects(new Error("DB failure"));
      try {
        await getUserGroupMemberById("test");
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingUserGroupMemberById",
        );
        expect(err.details.message).to.equal("DB failure");
      }
    });

    it("should wrap unexpected errors with HttpServerError (array of IDs)", async () => {
      UserGroupMemberStub.findAll.rejects(new Error("array failure"));
      try {
        await getUserGroupMemberById(["fail"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingUserGroupMemberById",
        );
        expect(err.details.message).to.equal("array failure");
      }
    });

    it("should return undefined if getData() returns undefined", async () => {
      UserGroupMemberStub.findOne.resolves({ getData: () => undefined });
      const result = await getUserGroupMemberById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should return array of undefineds if getData() returns undefined per item", async () => {
      UserGroupMemberStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getUserGroupMemberById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });
  });
});
