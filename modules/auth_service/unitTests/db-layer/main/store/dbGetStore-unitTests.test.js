const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbGetStoreCommand is exported from main code

describe("DbGetStoreCommand", () => {
  let DbGetStoreCommand, dbGetStore;
  let sandbox, StoreStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    StoreStub = {
      getCqrsJoins: sandbox.stub().resolves(),
    };

    BaseCommandStub = class {
      constructor(input, model) {
        this.input = input;
        this.model = model;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.storeId || 101 };
      }

      async execute() {
        return this.dbData;
      }

      loadHookFunctions() {}
      initOwnership() {}
      createEntityCacher() {}
    };

    ({ DbGetStoreCommand, dbGetStore } = proxyquire(
      "../../../../src/db-layer/main/store/dbGetStore",
      {
        models: { Store: StoreStub },
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
      const cmd = new DbGetStoreCommand({});
      expect(cmd.commandName).to.equal("dbGetStore");
      expect(cmd.objectName).to.equal("store");
      expect(cmd.serviceLabel).to.equal("salesai-auth-service");
      expect(cmd.nullResult).to.be.false;
    });
  });

  describe("getCqrsJoins", () => {
    it("should call Store.getCqrsJoins if exists", async () => {
      const cmd = new DbGetStoreCommand({});
      await cmd.getCqrsJoins({ test: true });
      sinon.assert.calledOnce(StoreStub.getCqrsJoins);
    });

    it("should skip getCqrsJoins if method is missing", async () => {
      delete StoreStub.getCqrsJoins;
      const cmd = new DbGetStoreCommand({});
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
      const cmd = new DbGetStoreCommand({});
      const result = cmd.buildIncludes(true);
      expect(result).to.deep.equal([]);
    });

    it("should return [] includes even if getJoins is absent", () => {
      const cmd = new DbGetStoreCommand({}); // input.getJoins is undefined
      const result = cmd.buildIncludes(false);
      expect(result).to.deep.equal([]);
    });
  });

  describe("dbGetStore", () => {
    it("should execute dbGetStore and return store data", async () => {
      const result = await dbGetStore({
        storeId: 777,
        session: "sess",
        requestId: "req",
      });

      expect(result).to.deep.equal({ id: 777 });
    });
  });
});
