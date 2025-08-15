const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("createUserGroupMember module", () => {
  let sandbox;
  let createUserGroupMember;
  let UserGroupMemberStub, ElasticIndexerStub, newUUIDStub;

  const fakeId = "uuid-123";
  const baseValidInput = {
    groupId: "groupId_val",
    userId: "userId_val",
    ownerId: "ownerId_val",
  };
  const mockCreatedUserGroupMember = {
    getData: () => ({ id: fakeId, ...baseValidInput }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    UserGroupMemberStub = {
      create: sandbox.stub().resolves(mockCreatedUserGroupMember),
    };

    ElasticIndexerStub = sandbox.stub().returns({
      indexData: sandbox.stub().resolves(),
    });

    newUUIDStub = sandbox.stub().returns(fakeId);

    createUserGroupMember = proxyquire(
      "../../../../../src/db-layer/main/UserGroupMember/utils/createUserGroupMember",
      {
        models: { UserGroupMember: UserGroupMemberStub },
        serviceCommon: { ElasticIndexer: ElasticIndexerStub },
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
          newUUID: newUUIDStub,
        },
      },
    );
  });

  afterEach(() => sandbox.restore());

  const getValidInput = (overrides = {}) => ({
    ...baseValidInput,
    ...overrides,
  });

  describe("createUserGroupMember", () => {
    it("should create UserGroupMember and index to elastic if valid data", async () => {
      const input = getValidInput();
      const result = await createUserGroupMember(input);

      expect(result).to.deep.equal({ id: fakeId, ...baseValidInput });
      sinon.assert.calledOnce(UserGroupMemberStub.create);
      sinon.assert.calledOnce(ElasticIndexerStub);
    });

    it("should throw HttpServerError if UserGroupMember.create fails", async () => {
      UserGroupMemberStub.create.rejects(new Error("DB error"));
      const input = getValidInput();

      try {
        await createUserGroupMember(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenCreatingUserGroupMember",
        );
        expect(err.details.message).to.equal("DB error");
      }
    });
  });

  describe("validateData", () => {
    it("should generate new UUID if id is not provided", async () => {
      const input = getValidInput();
      delete input.id;
      await createUserGroupMember(input);
      sinon.assert.calledOnce(newUUIDStub);
    });

    it("should use provided id if present", async () => {
      const input = getValidInput({ id: "existing-id" });
      await createUserGroupMember(input);
      sinon.assert.notCalled(newUUIDStub);
      sinon.assert.calledWith(
        UserGroupMemberStub.create,
        sinon.match({ id: "existing-id" }),
      );
    });

    it("should not throw if requiredFields is satisfied", async () => {
      const input = getValidInput();
      await createUserGroupMember(input);
    });

    it("should not overwrite id if already present", async () => {
      const input = getValidInput({ id: "custom-id" });
      await createUserGroupMember(input);
      sinon.assert.notCalled(newUUIDStub);
      sinon.assert.calledWith(
        UserGroupMemberStub.create,
        sinon.match({ id: "custom-id" }),
      );
    });

    it("should throw BadRequestError if required field is missing", async () => {
      const input = getValidInput();
      delete input["groupId"];
      try {
        await createUserGroupMember(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include('Field "groupId" is required');
      }
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer with userGroupMember data", async () => {
      const input = getValidInput();
      await createUserGroupMember(input);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });

    it("should throw HttpServerError if ElasticIndexer.indexData fails", async () => {
      ElasticIndexerStub().indexData.rejects(new Error("Elastic error"));
      const input = getValidInput();

      try {
        await createUserGroupMember(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenCreatingUserGroupMember",
        );
        expect(err.details.message).to.equal("Elastic error");
      }
    });
  });
});
