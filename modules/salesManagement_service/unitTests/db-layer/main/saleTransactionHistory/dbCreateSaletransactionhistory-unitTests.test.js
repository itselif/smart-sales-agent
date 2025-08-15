const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbCreateSaletransactionhistoryCommand is exported from main code
describe("DbCreateSaletransactionhistoryCommand", () => {
  let DbCreateSaletransactionhistoryCommand, dbCreateSaletransactionhistory;
  let sandbox,
    SaleTransactionHistoryStub,
    ElasticIndexerStub,
    getSaleTransactionHistoryByIdStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    SaleTransactionHistoryStub = {
      findByPk: sandbox.stub(),
      create: sandbox.stub(),
    };

    getSaleTransactionHistoryByIdStub = sandbox
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

    ({ DbCreateSaletransactionhistoryCommand, dbCreateSaletransactionhistory } =
      proxyquire(
        "../../../../src/db-layer/main/saleTransactionHistory/dbCreateSaletransactionhistory",
        {
          models: { SaleTransactionHistory: SaleTransactionHistoryStub },
          serviceCommon: { ElasticIndexer: ElasticIndexerStub },
          "./utils/getSaleTransactionHistoryById":
            getSaleTransactionHistoryByIdStub,
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
      const cmd = new DbCreateSaletransactionhistoryCommand({});
      expect(cmd.commandName).to.equal("dbCreateSaletransactionhistory");
      expect(cmd.objectName).to.equal("saleTransactionHistory");
      expect(cmd.serviceLabel).to.equal("salesai-salesmanagement-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-salesmanagement-service-dbevent-saletransactionhistory-created",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call getSaleTransactionHistoryById and indexData", async () => {
      const cmd = new DbCreateSaletransactionhistoryCommand({
        session: "session-id",
        requestId: "req-123",
      });
      cmd.dbData = { id: 1 };

      await cmd.indexDataToElastic();

      sinon.assert.calledWith(getSaleTransactionHistoryByIdStub, 1);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });
  });

  /* describe("runDbCommand", () => {
    

    it("should update existing saleTransactionHistory if found by unique index", async () => {
      const updateStub = sandbox.stub().resolves();
      const mocksaleTransactionHistory = { update: updateStub, getData: () => ({ id: 2 }) };

      SaleTransactionHistoryStub.findOne = sandbox.stub().resolves(mocksaleTransactionHistory);
      SaleTransactionHistoryStub.findByPk = sandbox.stub().resolves(null);

      const input = {
        dataClause: {
          
          id: "id_value",
          
          name: "updated"
        },
        checkoutResult: {}
      };

      const cmd = new DbCreateSaletransactionhistoryCommand(input);
      await cmd.runDbCommand();

      expect(input.saleTransactionHistory).to.deep.equal({ id: 2 });
      sinon.assert.calledOnce(updateStub);
    });

    it("should create new saleTransactionHistory if no unique match is found", async () => {
      SaleTransactionHistoryStub.findOne = sandbox.stub().resolves(null);
      SaleTransactionHistoryStub.findByPk = sandbox.stub().resolves(null);
      SaleTransactionHistoryStub.create.resolves({
        getData: () => ({ id: 5, name: "new" }),
      });

      const input = {
        dataClause: {
          
          name: "name_value",
          
          name: "new"
        }
      };

      const cmd = new DbCreateSaletransactionhistoryCommand(input);
      await cmd.runDbCommand();

      expect(input.saleTransactionHistory).to.deep.equal({ id: 5, name: "new" });
      sinon.assert.calledOnce(SaleTransactionHistoryStub.create);
    });

    it("should throw HttpServerError on Sequelize update failure", async () => {
      SaleTransactionHistoryStub.findByPk.rejects(new Error("Update failed"));

      const input = {
        dataClause: { id: 3 },
        checkoutResult: {},
      };

      const cmd = new DbCreateSaletransactionhistoryCommand(input);

      try {
        await cmd.runDbCommand();
        throw new Error("Should have thrown");
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.include("Error in checking unique index");
      }
    });
  });*/ //// go back to fix

  describe("dbCreateSaletransactionhistory", () => {
    it("should execute successfully and return dbData", async () => {
      SaleTransactionHistoryStub.create.resolves({
        getData: () => ({ id: 9 }),
      });

      const input = { dataClause: { name: "saleTransactionHistory" } };
      const result = await dbCreateSaletransactionhistory(input);

      expect(result).to.deep.equal({ id: 9 });
    });
  });
});
