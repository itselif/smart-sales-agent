const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbGetSaletransactionhistoryCommand is exported from main code

describe("DbGetSaletransactionhistoryCommand", () => {
  let DbGetSaletransactionhistoryCommand, dbGetSaletransactionhistory;
  let sandbox, SaleTransactionHistoryStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    SaleTransactionHistoryStub = {
      getCqrsJoins: sandbox.stub().resolves(),
    };

    BaseCommandStub = class {
      constructor(input, model) {
        this.input = input;
        this.model = model;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.saleTransactionHistoryId || 101 };
      }

      async execute() {
        return this.dbData;
      }

      loadHookFunctions() {}
      initOwnership() {}
      createEntityCacher() {}
    };

    ({ DbGetSaletransactionhistoryCommand, dbGetSaletransactionhistory } =
      proxyquire(
        "../../../../src/db-layer/main/saleTransactionHistory/dbGetSaletransactionhistory",
        {
          models: { SaleTransactionHistory: SaleTransactionHistoryStub },
          dbCommand: {
            DBGetSequelizeCommand: BaseCommandStub,
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
    it("should set command metadata correctly", () => {
      const cmd = new DbGetSaletransactionhistoryCommand({});
      expect(cmd.commandName).to.equal("dbGetSaletransactionhistory");
      expect(cmd.objectName).to.equal("saleTransactionHistory");
      expect(cmd.serviceLabel).to.equal("salesai-salesmanagement-service");
      expect(cmd.nullResult).to.be.false;
    });
  });

  describe("getCqrsJoins", () => {
    it("should call SaleTransactionHistory.getCqrsJoins if exists", async () => {
      const cmd = new DbGetSaletransactionhistoryCommand({});
      await cmd.getCqrsJoins({ test: true });
      sinon.assert.calledOnce(SaleTransactionHistoryStub.getCqrsJoins);
    });

    it("should skip getCqrsJoins if method is missing", async () => {
      delete SaleTransactionHistoryStub.getCqrsJoins;
      const cmd = new DbGetSaletransactionhistoryCommand({});
      let errorThrown = false;
      try {
        await cmd.getCqrsJoins({});
      } catch (err) {
        errorThrown = true;
      }

      expect(errorThrown).to.be.false;
    });
  });

  describe("buildIncludes", () => {
    it("should return [] includes", () => {
      const cmd = new DbGetSaletransactionhistoryCommand({});
      const result = cmd.buildIncludes(true);
      expect(result).to.deep.equal([]);
    });

    it("should return [] includes even if getJoins is absent", () => {
      const cmd = new DbGetSaletransactionhistoryCommand({}); // input.getJoins is undefined
      const result = cmd.buildIncludes(false);
      expect(result).to.deep.equal([]);
    });
  });

  describe("dbGetSaletransactionhistory", () => {
    it("should execute dbGetSaletransactionhistory and return saleTransactionHistory data", async () => {
      const result = await dbGetSaletransactionhistory({
        saleTransactionHistoryId: 777,
        session: "sess",
        requestId: "req",
      });

      expect(result).to.deep.equal({ id: 777 });
    });
  });
});
