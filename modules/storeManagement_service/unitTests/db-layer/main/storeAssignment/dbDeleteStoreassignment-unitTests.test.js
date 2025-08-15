const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbDeleteStoreassignmentCommand is exported from main code

describe("DbDeleteStoreassignmentCommand", () => {
  let DbDeleteStoreassignmentCommand, dbDeleteStoreassignment;
  let sandbox,
    StoreAssignmentStub,
    getStoreAssignmentByIdStub,
    ElasticIndexerStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    StoreAssignmentStub = {};

    getStoreAssignmentByIdStub = sandbox.stub();

    ElasticIndexerStub = sandbox.stub().returns({
      deleteData: sandbox.stub().resolves(),
    });

    BaseCommandStub = class {
      constructor(input, model, instanceMode) {
        this.input = input;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.storeAssignmentId || 123 };
        this.dbInstance = null;
      }

      loadHookFunctions() {}
      initOwnership() {}
      async execute() {
        await this.createQueryCacheInvalidator?.();
        await this.createDbInstance?.();
        await this.indexDataToElastic?.();
        return this.dbData;
      }
    };

    ({ DbDeleteStoreassignmentCommand, dbDeleteStoreassignment } = proxyquire(
      "../../../../src/db-layer/main/storeAssignment/dbDeleteStoreassignment",
      {
        models: { StoreAssignment: StoreAssignmentStub },
        "./query-cache-classes": {
          StoreAssignmentQueryCacheInvalidator: sandbox.stub(),
        },
        "./utils/getStoreAssignmentById": getStoreAssignmentByIdStub,
        serviceCommon: { ElasticIndexer: ElasticIndexerStub },
        dbCommand: {
          DBSoftDeleteSequelizeCommand: BaseCommandStub,
        },
        common: {
          NotFoundError: class NotFoundError extends Error {
            constructor(msg) {
              super(msg);
              this.name = "NotFoundError";
            }
          },
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
      const cmd = new DbDeleteStoreassignmentCommand({});
      expect(cmd.commandName).to.equal("dbDeleteStoreassignment");
      expect(cmd.objectName).to.equal("storeAssignment");
      expect(cmd.serviceLabel).to.equal("salesai-storemanagement-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-storemanagement-service-dbevent-storeassignment-deleted",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer.deleteData with dbData.id", async () => {
      const cmd = new DbDeleteStoreassignmentCommand({
        session: "sess",
        requestId: "req-1",
      });
      cmd.dbData = { id: 42 };

      await cmd.indexDataToElastic();

      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledWith(ElasticIndexerStub().deleteData, 42);
    });
  });

  describe("dbDeleteStoreassignment", () => {
    it("should execute deletion command successfully", async () => {
      const mockInstance = { id: 10 };
      getStoreAssignmentByIdStub.resolves(mockInstance);

      const input = {
        storeAssignmentId: 10,
        session: "s",
        requestId: "r",
      };

      const result = await dbDeleteStoreassignment(input);

      expect(result).to.deep.equal({ id: 10 });
    });
  });
  ////syncJoins() tests will be added here
});
