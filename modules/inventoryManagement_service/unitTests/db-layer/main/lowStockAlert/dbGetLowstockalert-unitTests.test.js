const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbGetLowstockalertCommand is exported from main code

describe("DbGetLowstockalertCommand", () => {
  let DbGetLowstockalertCommand, dbGetLowstockalert;
  let sandbox, LowStockAlertStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    LowStockAlertStub = {
      getCqrsJoins: sandbox.stub().resolves(),
    };

    BaseCommandStub = class {
      constructor(input, model) {
        this.input = input;
        this.model = model;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.lowStockAlertId || 101 };
      }

      async execute() {
        return this.dbData;
      }

      loadHookFunctions() {}
      initOwnership() {}
      createEntityCacher() {}
    };

    ({ DbGetLowstockalertCommand, dbGetLowstockalert } = proxyquire(
      "../../../../src/db-layer/main/lowStockAlert/dbGetLowstockalert",
      {
        models: { LowStockAlert: LowStockAlertStub },
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
      const cmd = new DbGetLowstockalertCommand({});
      expect(cmd.commandName).to.equal("dbGetLowstockalert");
      expect(cmd.objectName).to.equal("lowStockAlert");
      expect(cmd.serviceLabel).to.equal("salesai-inventorymanagement-service");
      expect(cmd.nullResult).to.be.false;
    });
  });

  describe("getCqrsJoins", () => {
    it("should call LowStockAlert.getCqrsJoins if exists", async () => {
      const cmd = new DbGetLowstockalertCommand({});
      await cmd.getCqrsJoins({ test: true });
      sinon.assert.calledOnce(LowStockAlertStub.getCqrsJoins);
    });

    it("should skip getCqrsJoins if method is missing", async () => {
      delete LowStockAlertStub.getCqrsJoins;
      const cmd = new DbGetLowstockalertCommand({});
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
      const cmd = new DbGetLowstockalertCommand({});
      const result = cmd.buildIncludes(true);
      expect(result).to.deep.equal([]);
    });

    it("should return [] includes even if getJoins is absent", () => {
      const cmd = new DbGetLowstockalertCommand({}); // input.getJoins is undefined
      const result = cmd.buildIncludes(false);
      expect(result).to.deep.equal([]);
    });
  });

  describe("dbGetLowstockalert", () => {
    it("should execute dbGetLowstockalert and return lowStockAlert data", async () => {
      const result = await dbGetLowstockalert({
        lowStockAlertId: 777,
        session: "sess",
        requestId: "req",
      });

      expect(result).to.deep.equal({ id: 777 });
    });
  });
});
