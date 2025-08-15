const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbCreateStoreassignmentCommand is exported from main code
describe("DbCreateStoreassignmentCommand", () => {
  let DbCreateStoreassignmentCommand, dbCreateStoreassignment;
  let sandbox,
    StoreAssignmentStub,
    ElasticIndexerStub,
    getStoreAssignmentByIdStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    StoreAssignmentStub = {
      findByPk: sandbox.stub(),
      create: sandbox.stub(),
    };

    getStoreAssignmentByIdStub = sandbox
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

    ({ DbCreateStoreassignmentCommand, dbCreateStoreassignment } = proxyquire(
      "../../../../src/db-layer/main/storeAssignment/dbCreateStoreassignment",
      {
        models: { StoreAssignment: StoreAssignmentStub },
        serviceCommon: { ElasticIndexer: ElasticIndexerStub },
        "./utils/getStoreAssignmentById": getStoreAssignmentByIdStub,
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
      const cmd = new DbCreateStoreassignmentCommand({});
      expect(cmd.commandName).to.equal("dbCreateStoreassignment");
      expect(cmd.objectName).to.equal("storeAssignment");
      expect(cmd.serviceLabel).to.equal("salesai-storemanagement-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-storemanagement-service-dbevent-storeassignment-created",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call getStoreAssignmentById and indexData", async () => {
      const cmd = new DbCreateStoreassignmentCommand({
        session: "session-id",
        requestId: "req-123",
      });
      cmd.dbData = { id: 1 };

      await cmd.indexDataToElastic();

      sinon.assert.calledWith(getStoreAssignmentByIdStub, 1);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });
  });

  /* describe("runDbCommand", () => {
    

    it("should update existing storeAssignment if found by unique index", async () => {
      const updateStub = sandbox.stub().resolves();
      const mockstoreAssignment = { update: updateStub, getData: () => ({ id: 2 }) };

      StoreAssignmentStub.findOne = sandbox.stub().resolves(mockstoreAssignment);
      StoreAssignmentStub.findByPk = sandbox.stub().resolves(null);

      const input = {
        dataClause: {
          
          userId: "userId_value",
          
          storeId: "storeId_value",
          
          assignmentType: "assignmentType_value",
          
          name: "updated"
        },
        checkoutResult: {}
      };

      const cmd = new DbCreateStoreassignmentCommand(input);
      await cmd.runDbCommand();

      expect(input.storeAssignment).to.deep.equal({ id: 2 });
      sinon.assert.calledOnce(updateStub);
    });

    it("should create new storeAssignment if no unique match is found", async () => {
      StoreAssignmentStub.findOne = sandbox.stub().resolves(null);
      StoreAssignmentStub.findByPk = sandbox.stub().resolves(null);
      StoreAssignmentStub.create.resolves({
        getData: () => ({ id: 5, name: "new" }),
      });

      const input = {
        dataClause: {
          
          userId: "userId_value",
          
          storeId: "storeId_value",
          
          assignmentType: "assignmentType_value",
          
          name: "new"
        }
      };

      const cmd = new DbCreateStoreassignmentCommand(input);
      await cmd.runDbCommand();

      expect(input.storeAssignment).to.deep.equal({ id: 5, name: "new" });
      sinon.assert.calledOnce(StoreAssignmentStub.create);
    });

    it("should throw HttpServerError on Sequelize update failure", async () => {
      StoreAssignmentStub.findByPk.rejects(new Error("Update failed"));

      const input = {
        dataClause: { id: 3 },
        checkoutResult: {},
      };

      const cmd = new DbCreateStoreassignmentCommand(input);

      try {
        await cmd.runDbCommand();
        throw new Error("Should have thrown");
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.include("Error in checking unique index");
      }
    });
  });*/ //// go back to fix

  describe("dbCreateStoreassignment", () => {
    it("should execute successfully and return dbData", async () => {
      StoreAssignmentStub.create.resolves({ getData: () => ({ id: 9 }) });

      const input = { dataClause: { name: "storeAssignment" } };
      const result = await dbCreateStoreassignment(input);

      expect(result).to.deep.equal({ id: 9 });
    });
  });
});
