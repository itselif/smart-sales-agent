const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbGetStoreassignmentCommand is exported from main code

describe("DbGetStoreassignmentCommand", () => {
  let DbGetStoreassignmentCommand, dbGetStoreassignment;
  let sandbox, StoreAssignmentStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    StoreAssignmentStub = {
      getCqrsJoins: sandbox.stub().resolves(),
    };

    BaseCommandStub = class {
      constructor(input, model) {
        this.input = input;
        this.model = model;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.storeAssignmentId || 101 };
      }

      async execute() {
        return this.dbData;
      }

      loadHookFunctions() {}
      initOwnership() {}
      createEntityCacher() {}
    };

    ({ DbGetStoreassignmentCommand, dbGetStoreassignment } = proxyquire(
      "../../../../src/db-layer/main/storeAssignment/dbGetStoreassignment",
      {
        models: { StoreAssignment: StoreAssignmentStub },
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
      const cmd = new DbGetStoreassignmentCommand({});
      expect(cmd.commandName).to.equal("dbGetStoreassignment");
      expect(cmd.objectName).to.equal("storeAssignment");
      expect(cmd.serviceLabel).to.equal("salesai-storemanagement-service");
      expect(cmd.nullResult).to.be.false;
    });
  });

  describe("getCqrsJoins", () => {
    it("should call StoreAssignment.getCqrsJoins if exists", async () => {
      const cmd = new DbGetStoreassignmentCommand({});
      await cmd.getCqrsJoins({ test: true });
      sinon.assert.calledOnce(StoreAssignmentStub.getCqrsJoins);
    });

    it("should skip getCqrsJoins if method is missing", async () => {
      delete StoreAssignmentStub.getCqrsJoins;
      const cmd = new DbGetStoreassignmentCommand({});
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
      const cmd = new DbGetStoreassignmentCommand({});
      const result = cmd.buildIncludes(true);
      expect(result).to.deep.equal([]);
    });

    it("should return [] includes even if getJoins is absent", () => {
      const cmd = new DbGetStoreassignmentCommand({}); // input.getJoins is undefined
      const result = cmd.buildIncludes(false);
      expect(result).to.deep.equal([]);
    });
  });

  describe("dbGetStoreassignment", () => {
    it("should execute dbGetStoreassignment and return storeAssignment data", async () => {
      const result = await dbGetStoreassignment({
        storeAssignmentId: 777,
        session: "sess",
        requestId: "req",
      });

      expect(result).to.deep.equal({ id: 777 });
    });
  });
});
