const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbCreateStoreCommand is exported from main code
describe("DbCreateStoreCommand", () => {
  let DbCreateStoreCommand, dbCreateStore;
  let sandbox, StoreStub, ElasticIndexerStub, getStoreByIdStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    StoreStub = {
      findByPk: sandbox.stub(),
      create: sandbox.stub(),
    };

    getStoreByIdStub = sandbox.stub().resolves({ id: 1, name: "Mock Client" });

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

    ({ DbCreateStoreCommand, dbCreateStore } = proxyquire(
      "../../../../src/db-layer/main/store/dbCreateStore",
      {
        models: { Store: StoreStub },
        serviceCommon: { ElasticIndexer: ElasticIndexerStub },
        "./utils/getStoreById": getStoreByIdStub,
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
      const cmd = new DbCreateStoreCommand({});
      expect(cmd.commandName).to.equal("dbCreateStore");
      expect(cmd.objectName).to.equal("store");
      expect(cmd.serviceLabel).to.equal("salesai-storemanagement-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-storemanagement-service-dbevent-store-created",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call getStoreById and indexData", async () => {
      const cmd = new DbCreateStoreCommand({
        session: "session-id",
        requestId: "req-123",
      });
      cmd.dbData = { id: 1 };

      await cmd.indexDataToElastic();

      sinon.assert.calledWith(getStoreByIdStub, 1);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });
  });

  /* describe("runDbCommand", () => {
    

    it("should update existing store if found by unique index", async () => {
      const updateStub = sandbox.stub().resolves();
      const mockstore = { update: updateStub, getData: () => ({ id: 2 }) };

      StoreStub.findOne = sandbox.stub().resolves(mockstore);
      StoreStub.findByPk = sandbox.stub().resolves(null);

      const input = {
        dataClause: {
          
          name: "name_value",
          
          name: "updated"
        },
        checkoutResult: {}
      };

      const cmd = new DbCreateStoreCommand(input);
      await cmd.runDbCommand();

      expect(input.store).to.deep.equal({ id: 2 });
      sinon.assert.calledOnce(updateStub);
    });

    it("should create new store if no unique match is found", async () => {
      StoreStub.findOne = sandbox.stub().resolves(null);
      StoreStub.findByPk = sandbox.stub().resolves(null);
      StoreStub.create.resolves({
        getData: () => ({ id: 5, name: "new" }),
      });

      const input = {
        dataClause: {
          
          name: "name_value",
          
          name: "new"
        }
      };

      const cmd = new DbCreateStoreCommand(input);
      await cmd.runDbCommand();

      expect(input.store).to.deep.equal({ id: 5, name: "new" });
      sinon.assert.calledOnce(StoreStub.create);
    });

    it("should throw HttpServerError on Sequelize update failure", async () => {
      StoreStub.findByPk.rejects(new Error("Update failed"));

      const input = {
        dataClause: { id: 3 },
        checkoutResult: {},
      };

      const cmd = new DbCreateStoreCommand(input);

      try {
        await cmd.runDbCommand();
        throw new Error("Should have thrown");
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.include("Error in checking unique index");
      }
    });
  });*/ //// go back to fix

  describe("dbCreateStore", () => {
    it("should execute successfully and return dbData", async () => {
      StoreStub.create.resolves({ getData: () => ({ id: 9 }) });

      const input = { dataClause: { name: "store" } };
      const result = await dbCreateStore(input);

      expect(result).to.deep.equal({ id: 9 });
    });
  });
});
