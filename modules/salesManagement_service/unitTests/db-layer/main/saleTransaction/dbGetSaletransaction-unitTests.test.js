const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbGetSaletransactionCommand is exported from main code

describe("DbGetSaletransactionCommand", () => {
  let DbGetSaletransactionCommand, dbGetSaletransaction;
  let sandbox, SaleTransactionStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    SaleTransactionStub = {
      getCqrsJoins: sandbox.stub().resolves(),
    };

    BaseCommandStub = class {
      constructor(input, model) {
        this.input = input;
        this.model = model;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.saleTransactionId || 101 };
      }

      async execute() {
        return this.dbData;
      }

      loadHookFunctions() {}
      initOwnership() {}
      createEntityCacher() {}
    };

    ({ DbGetSaletransactionCommand, dbGetSaletransaction } = proxyquire(
      "../../../../src/db-layer/main/saleTransaction/dbGetSaletransaction",
      {
        models: { SaleTransaction: SaleTransactionStub },
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
      const cmd = new DbGetSaletransactionCommand({});
      expect(cmd.commandName).to.equal("dbGetSaletransaction");
      expect(cmd.objectName).to.equal("saleTransaction");
      expect(cmd.serviceLabel).to.equal("salesai-salesmanagement-service");
      expect(cmd.nullResult).to.be.false;
    });
  });

  describe("getCqrsJoins", () => {
    it("should call SaleTransaction.getCqrsJoins if exists", async () => {
      const cmd = new DbGetSaletransactionCommand({});
      await cmd.getCqrsJoins({ test: true });
      sinon.assert.calledOnce(SaleTransactionStub.getCqrsJoins);
    });

    it("should skip getCqrsJoins if method is missing", async () => {
      delete SaleTransactionStub.getCqrsJoins;
      const cmd = new DbGetSaletransactionCommand({});
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
      const cmd = new DbGetSaletransactionCommand({});
      const result = cmd.buildIncludes(true);
      expect(result).to.deep.equal([]);
    });

    it("should return [] includes even if getJoins is absent", () => {
      const cmd = new DbGetSaletransactionCommand({}); // input.getJoins is undefined
      const result = cmd.buildIncludes(false);
      expect(result).to.deep.equal([]);
    });
  });

  describe("dbGetSaletransaction", () => {
    it("should execute dbGetSaletransaction and return saleTransaction data", async () => {
      const result = await dbGetSaletransaction({
        saleTransactionId: 777,
        session: "sess",
        requestId: "req",
      });

      expect(result).to.deep.equal({ id: 777 });
    });
  });
});
