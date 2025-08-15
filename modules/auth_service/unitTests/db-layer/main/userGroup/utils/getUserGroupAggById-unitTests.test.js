const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getUserGroupAggById module", () => {
  let sandbox;
  let getUserGroupAggById;
  let UserGroupStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test UserGroup" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    UserGroupStub = {
      findOne: sandbox.stub().resolves({ getData: () => fakeData }),
      findAll: sandbox
        .stub()
        .resolves([
          { getData: () => ({ id: "1", name: "Item 1" }) },
          { getData: () => ({ id: "2", name: "Item 2" }) },
        ]),
      getCqrsJoins: sandbox.stub().resolves(),
    };

    getUserGroupAggById = proxyquire(
      "../../../../../src/db-layer/main/UserGroup/utils/getUserGroupAggById",
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
        },
        sequelize: { Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getUserGroupAggById", () => {
    it("should return getData() with includes for single ID", async () => {
      const result = await getUserGroupAggById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(UserGroupStub.findOne);
      sinon.assert.calledOnce(UserGroupStub.getCqrsJoins);
    });

    it("should return mapped getData() for array of IDs", async () => {
      const result = await getUserGroupAggById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(UserGroupStub.findAll);
      sinon.assert.calledOnce(UserGroupStub.getCqrsJoins);
    });

    it("should return null if not found for single ID", async () => {
      UserGroupStub.findOne.resolves(null);
      const result = await getUserGroupAggById(fakeId);
      expect(result).to.equal(null);
    });

    it("should return empty array if input is array but no results", async () => {
      UserGroupStub.findAll.resolves([]);
      const result = await getUserGroupAggById(["nope"]);
      expect(result).to.deep.equal([]);
    });

    it("should return undefined if getData returns undefined in array items", async () => {
      UserGroupStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getUserGroupAggById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });

    it("should return undefined if getData returns undefined in single ID", async () => {
      UserGroupStub.findOne.resolves({ getData: () => undefined });
      const result = await getUserGroupAggById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should throw HttpServerError on unexpected error (findOne)", async () => {
      UserGroupStub.findOne.rejects(new Error("fail"));
      try {
        await getUserGroupAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingUserGroupAggById",
        );
        expect(err.details.message).to.equal("fail");
      }
    });

    it("should throw HttpServerError on unexpected error (findAll)", async () => {
      UserGroupStub.findAll.rejects(new Error("all fail"));
      try {
        await getUserGroupAggById(["1"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingUserGroupAggById",
        );
        expect(err.details.message).to.equal("all fail");
      }
    });

    it("should throw HttpServerError if getCqrsJoins fails", async () => {
      UserGroupStub.getCqrsJoins.rejects(new Error("joins fail"));
      try {
        await getUserGroupAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingUserGroupAggById",
        );
        expect(err.details.message).to.equal("joins fail");
      }
    });
  });
});
