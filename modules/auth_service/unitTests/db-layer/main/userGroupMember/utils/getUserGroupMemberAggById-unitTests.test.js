const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getUserGroupMemberAggById module", () => {
  let sandbox;
  let getUserGroupMemberAggById;
  let UserGroupMemberStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test UserGroupMember" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    UserGroupMemberStub = {
      findOne: sandbox.stub().resolves({ getData: () => fakeData }),
      findAll: sandbox
        .stub()
        .resolves([
          { getData: () => ({ id: "1", name: "Item 1" }) },
          { getData: () => ({ id: "2", name: "Item 2" }) },
        ]),
      getCqrsJoins: sandbox.stub().resolves(),
    };

    getUserGroupMemberAggById = proxyquire(
      "../../../../../src/db-layer/main/UserGroupMember/utils/getUserGroupMemberAggById",
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

  describe("getUserGroupMemberAggById", () => {
    it("should return getData() with includes for single ID", async () => {
      const result = await getUserGroupMemberAggById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(UserGroupMemberStub.findOne);
      sinon.assert.calledOnce(UserGroupMemberStub.getCqrsJoins);
    });

    it("should return mapped getData() for array of IDs", async () => {
      const result = await getUserGroupMemberAggById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(UserGroupMemberStub.findAll);
      sinon.assert.calledOnce(UserGroupMemberStub.getCqrsJoins);
    });

    it("should return null if not found for single ID", async () => {
      UserGroupMemberStub.findOne.resolves(null);
      const result = await getUserGroupMemberAggById(fakeId);
      expect(result).to.equal(null);
    });

    it("should return empty array if input is array but no results", async () => {
      UserGroupMemberStub.findAll.resolves([]);
      const result = await getUserGroupMemberAggById(["nope"]);
      expect(result).to.deep.equal([]);
    });

    it("should return undefined if getData returns undefined in array items", async () => {
      UserGroupMemberStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getUserGroupMemberAggById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });

    it("should return undefined if getData returns undefined in single ID", async () => {
      UserGroupMemberStub.findOne.resolves({ getData: () => undefined });
      const result = await getUserGroupMemberAggById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should throw HttpServerError on unexpected error (findOne)", async () => {
      UserGroupMemberStub.findOne.rejects(new Error("fail"));
      try {
        await getUserGroupMemberAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingUserGroupMemberAggById",
        );
        expect(err.details.message).to.equal("fail");
      }
    });

    it("should throw HttpServerError on unexpected error (findAll)", async () => {
      UserGroupMemberStub.findAll.rejects(new Error("all fail"));
      try {
        await getUserGroupMemberAggById(["1"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingUserGroupMemberAggById",
        );
        expect(err.details.message).to.equal("all fail");
      }
    });

    it("should throw HttpServerError if getCqrsJoins fails", async () => {
      UserGroupMemberStub.getCqrsJoins.rejects(new Error("joins fail"));
      try {
        await getUserGroupMemberAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingUserGroupMemberAggById",
        );
        expect(err.details.message).to.equal("joins fail");
      }
    });
  });
});
