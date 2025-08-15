const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbCreateSaletransactionCommand is exported from main code
describe("DbCreateSaletransactionCommand", () => {
  let DbCreateSaletransactionCommand, dbCreateSaletransaction;
  let sandbox,
    SaleTransactionStub,
    ElasticIndexerStub,
    getSaleTransactionByIdStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    SaleTransactionStub = {
      findByPk: sandbox.stub(),
      create: sandbox.stub(),
    };

    getSaleTransactionByIdStub = sandbox
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

    ({ DbCreateSaletransactionCommand, dbCreateSaletransaction } = proxyquire(
      "../../../../src/db-layer/main/saleTransaction/dbCreateSaletransaction",
      {
        models: { SaleTransaction: SaleTransactionStub },
        serviceCommon: { ElasticIndexer: ElasticIndexerStub },
        "./utils/getSaleTransactionById": getSaleTransactionByIdStub,
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
      const cmd = new DbCreateSaletransactionCommand({});
      expect(cmd.commandName).to.equal("dbCreateSaletransaction");
      expect(cmd.objectName).to.equal("saleTransaction");
      expect(cmd.serviceLabel).to.equal("salesai-salesmanagement-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-salesmanagement-service-dbevent-saletransaction-created",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call getSaleTransactionById and indexData", async () => {
      const cmd = new DbCreateSaletransactionCommand({
        session: "session-id",
        requestId: "req-123",
      });
      cmd.dbData = { id: 1 };

      await cmd.indexDataToElastic();

      sinon.assert.calledWith(getSaleTransactionByIdStub, 1);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });
  });

  /* describe("runDbCommand", () => {
    

    it("should update existing saleTransaction if found by unique index", async () => {
      const updateStub = sandbox.stub().resolves();
      const mocksaleTransaction = { update: updateStub, getData: () => ({ id: 2 }) };

      SaleTransactionStub.findOne = sandbox.stub().resolves(mocksaleTransaction);
      SaleTransactionStub.findByPk = sandbox.stub().resolves(null);

      const input = {
        dataClause: {
          
          id: "id_value",
          
          name: "updated"
        },
        checkoutResult: {}
      };

      const cmd = new DbCreateSaletransactionCommand(input);
      await cmd.runDbCommand();

      expect(input.saleTransaction).to.deep.equal({ id: 2 });
      sinon.assert.calledOnce(updateStub);
    });

    it("should create new saleTransaction if no unique match is found", async () => {
      SaleTransactionStub.findOne = sandbox.stub().resolves(null);
      SaleTransactionStub.findByPk = sandbox.stub().resolves(null);
      SaleTransactionStub.create.resolves({
        getData: () => ({ id: 5, name: "new" }),
      });

      const input = {
        dataClause: {
          
          name: "name_value",
          
          name: "new"
        }
      };

      const cmd = new DbCreateSaletransactionCommand(input);
      await cmd.runDbCommand();

      expect(input.saleTransaction).to.deep.equal({ id: 5, name: "new" });
      sinon.assert.calledOnce(SaleTransactionStub.create);
    });

    it("should throw HttpServerError on Sequelize update failure", async () => {
      SaleTransactionStub.findByPk.rejects(new Error("Update failed"));

      const input = {
        dataClause: { id: 3 },
        checkoutResult: {},
      };

      const cmd = new DbCreateSaletransactionCommand(input);

      try {
        await cmd.runDbCommand();
        throw new Error("Should have thrown");
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.include("Error in checking unique index");
      }
    });
  });*/ //// go back to fix

  describe("dbCreateSaletransaction", () => {
    it("should execute successfully and return dbData", async () => {
      SaleTransactionStub.create.resolves({ getData: () => ({ id: 9 }) });

      const input = { dataClause: { name: "saleTransaction" } };
      const result = await dbCreateSaletransaction(input);

      expect(result).to.deep.equal({ id: 9 });
    });
  });
});
