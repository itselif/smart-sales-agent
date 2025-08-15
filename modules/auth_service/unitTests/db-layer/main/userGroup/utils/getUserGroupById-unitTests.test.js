const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getUserGroupById module", () => {
  let sandbox;
  let getUserGroupById;
  let UserGroupStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test UserGroup" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    UserGroupStub = {
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

    getUserGroupById = proxyquire(
      "../../../../../src/db-layer/main/UserGroup/utils/getUserGroupById",
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

  describe("getUserGroupById", () => {
    it("should return getData() for single ID", async () => {
      const result = await getUserGroupById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(UserGroupStub.findOne);
      sinon.assert.calledWith(
        UserGroupStub.findOne,
        sinon.match.has("where", sinon.match.has("id", fakeId)),
      );
    });

    it("should return mapped getData() results for array of IDs", async () => {
      const result = await getUserGroupById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(UserGroupStub.findAll);
      sinon.assert.calledWithMatch(UserGroupStub.findAll, {
        where: { id: { [Op.in]: ["1", "2"] } },
      });
    });

    it("should return null if record not found (single ID)", async () => {
      UserGroupStub.findOne.resolves(null);
      const result = await getUserGroupById(fakeId);
      expect(result).to.be.null;
    });

    it("should return null if empty array returned from findAll", async () => {
      UserGroupStub.findAll.resolves([]);
      const result = await getUserGroupById(["a", "b"]);
      expect(result).to.deep.equal([]);
    });

    it("should wrap unexpected errors with HttpServerError (single ID)", async () => {
      UserGroupStub.findOne.rejects(new Error("DB failure"));
      try {
        await getUserGroupById("test");
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingUserGroupById",
        );
        expect(err.details.message).to.equal("DB failure");
      }
    });

    it("should wrap unexpected errors with HttpServerError (array of IDs)", async () => {
      UserGroupStub.findAll.rejects(new Error("array failure"));
      try {
        await getUserGroupById(["fail"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingUserGroupById",
        );
        expect(err.details.message).to.equal("array failure");
      }
    });

    it("should return undefined if getData() returns undefined", async () => {
      UserGroupStub.findOne.resolves({ getData: () => undefined });
      const result = await getUserGroupById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should return array of undefineds if getData() returns undefined per item", async () => {
      UserGroupStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getUserGroupById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });
  });
});
