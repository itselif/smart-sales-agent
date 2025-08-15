const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbGetOpenapischemaCommand is exported from main code

describe("DbGetOpenapischemaCommand", () => {
  let DbGetOpenapischemaCommand, dbGetOpenapischema;
  let sandbox, OpenApiSchemaStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    OpenApiSchemaStub = {
      getCqrsJoins: sandbox.stub().resolves(),
    };

    BaseCommandStub = class {
      constructor(input, model) {
        this.input = input;
        this.model = model;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.openApiSchemaId || 101 };
      }

      async execute() {
        return this.dbData;
      }

      loadHookFunctions() {}
      initOwnership() {}
      createEntityCacher() {}
    };

    ({ DbGetOpenapischemaCommand, dbGetOpenapischema } = proxyquire(
      "../../../../src/db-layer/main/openApiSchema/dbGetOpenapischema",
      {
        models: { OpenApiSchema: OpenApiSchemaStub },
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
      const cmd = new DbGetOpenapischemaCommand({});
      expect(cmd.commandName).to.equal("dbGetOpenapischema");
      expect(cmd.objectName).to.equal("openApiSchema");
      expect(cmd.serviceLabel).to.equal("salesai-platformadmin-service");
      expect(cmd.nullResult).to.be.false;
    });
  });

  describe("getCqrsJoins", () => {
    it("should call OpenApiSchema.getCqrsJoins if exists", async () => {
      const cmd = new DbGetOpenapischemaCommand({});
      await cmd.getCqrsJoins({ test: true });
      sinon.assert.calledOnce(OpenApiSchemaStub.getCqrsJoins);
    });

    it("should skip getCqrsJoins if method is missing", async () => {
      delete OpenApiSchemaStub.getCqrsJoins;
      const cmd = new DbGetOpenapischemaCommand({});
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
      const cmd = new DbGetOpenapischemaCommand({});
      const result = cmd.buildIncludes(true);
      expect(result).to.deep.equal([]);
    });

    it("should return [] includes even if getJoins is absent", () => {
      const cmd = new DbGetOpenapischemaCommand({}); // input.getJoins is undefined
      const result = cmd.buildIncludes(false);
      expect(result).to.deep.equal([]);
    });
  });

  describe("dbGetOpenapischema", () => {
    it("should execute dbGetOpenapischema and return openApiSchema data", async () => {
      const result = await dbGetOpenapischema({
        openApiSchemaId: 777,
        session: "sess",
        requestId: "req",
      });

      expect(result).to.deep.equal({ id: 777 });
    });
  });
});
