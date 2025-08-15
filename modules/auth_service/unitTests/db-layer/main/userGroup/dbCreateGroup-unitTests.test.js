const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbCreateGroupCommand is exported from main code
describe("DbCreateGroupCommand", () => {
  let DbCreateGroupCommand, dbCreateGroup;
  let sandbox,
    UserGroupStub,
    ElasticIndexerStub,
    getUserGroupByIdStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    UserGroupStub = {
      findByPk: sandbox.stub(),
      create: sandbox.stub(),
    };

    getUserGroupByIdStub = sandbox
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

    ({ DbCreateGroupCommand, dbCreateGroup } = proxyquire(
      "../../../../src/db-layer/main/userGroup/dbCreateGroup",
      {
        models: { UserGroup: UserGroupStub },
        serviceCommon: { ElasticIndexer: ElasticIndexerStub },
        "./utils/getUserGroupById": getUserGroupByIdStub,
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
      const cmd = new DbCreateGroupCommand({});
      expect(cmd.commandName).to.equal("dbCreateGroup");
      expect(cmd.objectName).to.equal("userGroup");
      expect(cmd.serviceLabel).to.equal("salesai-auth-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-auth-service-dbevent-usergroup-created",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call getUserGroupById and indexData", async () => {
      const cmd = new DbCreateGroupCommand({
        session: "session-id",
        requestId: "req-123",
      });
      cmd.dbData = { id: 1 };

      await cmd.indexDataToElastic();

      sinon.assert.calledWith(getUserGroupByIdStub, 1);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });
  });

  /* describe("runDbCommand", () => {
    

    it("should update existing userGroup if found by unique index", async () => {
      const updateStub = sandbox.stub().resolves();
      const mockuserGroup = { update: updateStub, getData: () => ({ id: 2 }) };

      UserGroupStub.findOne = sandbox.stub().resolves(mockuserGroup);
      UserGroupStub.findByPk = sandbox.stub().resolves(null);

      const input = {
        dataClause: {
          
          id: "id_value",
          
          name: "updated"
        },
        checkoutResult: {}
      };

      const cmd = new DbCreateGroupCommand(input);
      await cmd.runDbCommand();

      expect(input.userGroup).to.deep.equal({ id: 2 });
      sinon.assert.calledOnce(updateStub);
    });

    it("should create new userGroup if no unique match is found", async () => {
      UserGroupStub.findOne = sandbox.stub().resolves(null);
      UserGroupStub.findByPk = sandbox.stub().resolves(null);
      UserGroupStub.create.resolves({
        getData: () => ({ id: 5, name: "new" }),
      });

      const input = {
        dataClause: {
          
          name: "name_value",
          
          name: "new"
        }
      };

      const cmd = new DbCreateGroupCommand(input);
      await cmd.runDbCommand();

      expect(input.userGroup).to.deep.equal({ id: 5, name: "new" });
      sinon.assert.calledOnce(UserGroupStub.create);
    });

    it("should throw HttpServerError on Sequelize update failure", async () => {
      UserGroupStub.findByPk.rejects(new Error("Update failed"));

      const input = {
        dataClause: { id: 3 },
        checkoutResult: {},
      };

      const cmd = new DbCreateGroupCommand(input);

      try {
        await cmd.runDbCommand();
        throw new Error("Should have thrown");
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.include("Error in checking unique index");
      }
    });
  });*/ //// go back to fix

  describe("dbCreateGroup", () => {
    it("should execute successfully and return dbData", async () => {
      UserGroupStub.create.resolves({ getData: () => ({ id: 9 }) });

      const input = { dataClause: { name: "userGroup" } };
      const result = await dbCreateGroup(input);

      expect(result).to.deep.equal({ id: 9 });
    });
  });
});
