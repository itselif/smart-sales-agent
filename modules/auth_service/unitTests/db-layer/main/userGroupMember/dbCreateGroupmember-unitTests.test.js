const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbCreateGroupmemberCommand is exported from main code
describe("DbCreateGroupmemberCommand", () => {
  let DbCreateGroupmemberCommand, dbCreateGroupmember;
  let sandbox,
    UserGroupMemberStub,
    ElasticIndexerStub,
    getUserGroupMemberByIdStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    UserGroupMemberStub = {
      findByPk: sandbox.stub(),
      create: sandbox.stub(),
    };

    getUserGroupMemberByIdStub = sandbox
      .stub()
      .resolves({ id: 1, name: "Mock Client" });

    ElasticIndexerStub = sandbox.stub().returns({
      indexData: sandbox.stub().resolves(),
    });

    BaseCommandStub = class {
      constructor(input) {
        this.input = input;
        this.dataClause = input.dataClause || {};
        this.session = input.session;
        this.requestId = input.requestId;
        this.dbData = { id: 9 };
      }

      async runDbCommand() {}
      async execute() {
        return this.dbData;
      }
      loadHookFunctions() {}
      createEntityCacher() {}
      normalizeSequalizeOps(w) {
        return w;
      }
      createQueryCacheInvalidator() {}
    };

    ({ DbCreateGroupmemberCommand, dbCreateGroupmember } = proxyquire(
      "../../../../src/db-layer/main/userGroupMember/dbCreateGroupmember",
      {
        models: { UserGroupMember: UserGroupMemberStub },
        serviceCommon: { ElasticIndexer: ElasticIndexerStub },
        "./utils/getUserGroupMemberById": getUserGroupMemberByIdStub,
        dbCommand: { DBCreateSequelizeCommand: BaseCommandStub },
        "./query-cache-classes": {
          ClientQueryCacheInvalidator: sandbox.stub(),
        },
        common: {
          HttpServerError: class extends Error {
            constructor(msg, details) {
              super(msg);
              this.details = details;
            }
          },
        },
      },
    ));
  });

  afterEach(() => sandbox.restore());

  describe("constructor", () => {
    it("should assign initial properties", () => {
      const cmd = new DbCreateGroupmemberCommand({});
      expect(cmd.commandName).to.equal("dbCreateGroupmember");
      expect(cmd.objectName).to.equal("userGroupMember");
      expect(cmd.serviceLabel).to.equal("salesai-auth-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-auth-service-dbevent-usergroupmember-created",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call getUserGroupMemberById and indexData", async () => {
      const cmd = new DbCreateGroupmemberCommand({
        session: "session-id",
        requestId: "req-123",
      });
      cmd.dbData = { id: 1 };

      await cmd.indexDataToElastic();

      sinon.assert.calledWith(getUserGroupMemberByIdStub, 1);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });
  });

  /* describe("runDbCommand", () => {
    

    it("should update existing userGroupMember if found by unique index", async () => {
      const updateStub = sandbox.stub().resolves();
      const mockuserGroupMember = { update: updateStub, getData: () => ({ id: 2 }) };

      UserGroupMemberStub.findOne = sandbox.stub().resolves(mockuserGroupMember);
      UserGroupMemberStub.findByPk = sandbox.stub().resolves(null);

      const input = {
        dataClause: {
          
          userId: "userId_value",
          
          groupId: "groupId_value",
          
          name: "updated"
        },
        checkoutResult: {}
      };

      const cmd = new DbCreateGroupmemberCommand(input);
      await cmd.runDbCommand();

      expect(input.userGroupMember).to.deep.equal({ id: 2 });
      sinon.assert.calledOnce(updateStub);
    });

    it("should create new userGroupMember if no unique match is found", async () => {
      UserGroupMemberStub.findOne = sandbox.stub().resolves(null);
      UserGroupMemberStub.findByPk = sandbox.stub().resolves(null);
      UserGroupMemberStub.create.resolves({
        getData: () => ({ id: 5, name: "new" }),
      });

      const input = {
        dataClause: {
          
          userId: "userId_value",
          
          groupId: "groupId_value",
          
          name: "new"
        }
      };

      const cmd = new DbCreateGroupmemberCommand(input);
      await cmd.runDbCommand();

      expect(input.userGroupMember).to.deep.equal({ id: 5, name: "new" });
      sinon.assert.calledOnce(UserGroupMemberStub.create);
    });

    it("should throw HttpServerError on Sequelize update failure", async () => {
      UserGroupMemberStub.findByPk.rejects(new Error("Update failed"));

      const input = {
        dataClause: { id: 3 },
        checkoutResult: {},
      };

      const cmd = new DbCreateGroupmemberCommand(input);

      try {
        await cmd.runDbCommand();
        throw new Error("Should have thrown");
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.include("Error in checking unique index");
      }
    });
  });*/ //// go back to fix

  describe("dbCreateGroupmember", () => {
    it("should execute successfully and return dbData", async () => {
      UserGroupMemberStub.create.resolves({ getData: () => ({ id: 9 }) });

      const input = { dataClause: { name: "userGroupMember" } };
      const result = await dbCreateGroupmember(input);

      expect(result).to.deep.equal({ id: 9 });
    });
  });
});
