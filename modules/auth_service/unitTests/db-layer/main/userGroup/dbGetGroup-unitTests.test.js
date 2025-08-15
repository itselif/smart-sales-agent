const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbGetGroupCommand is exported from main code

describe("DbGetGroupCommand", () => {
  let DbGetGroupCommand, dbGetGroup;
  let sandbox, UserGroupStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    UserGroupStub = {
      getCqrsJoins: sandbox.stub().resolves(),
    };

    BaseCommandStub = class {
      constructor(input, model) {
        this.input = input;
        this.model = model;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.userGroupId || 101 };
      }

      async execute() {
        return this.dbData;
      }

      loadHookFunctions() {}
      initOwnership() {}
      createEntityCacher() {}
    };

    ({ DbGetGroupCommand, dbGetGroup } = proxyquire(
      "../../../../src/db-layer/main/userGroup/dbGetGroup",
      {
        models: { UserGroup: UserGroupStub },
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
      const cmd = new DbGetGroupCommand({});
      expect(cmd.commandName).to.equal("dbGetGroup");
      expect(cmd.objectName).to.equal("userGroup");
      expect(cmd.serviceLabel).to.equal("salesai-auth-service");
      expect(cmd.nullResult).to.be.false;
    });
  });

  describe("getCqrsJoins", () => {
    it("should call UserGroup.getCqrsJoins if exists", async () => {
      const cmd = new DbGetGroupCommand({});
      await cmd.getCqrsJoins({ test: true });
      sinon.assert.calledOnce(UserGroupStub.getCqrsJoins);
    });

    it("should skip getCqrsJoins if method is missing", async () => {
      delete UserGroupStub.getCqrsJoins;
      const cmd = new DbGetGroupCommand({});
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
      const cmd = new DbGetGroupCommand({});
      const result = cmd.buildIncludes(true);
      expect(result).to.deep.equal([]);
    });

    it("should return [] includes even if getJoins is absent", () => {
      const cmd = new DbGetGroupCommand({}); // input.getJoins is undefined
      const result = cmd.buildIncludes(false);
      expect(result).to.deep.equal([]);
    });
  });

  describe("dbGetGroup", () => {
    it("should execute dbGetGroup and return userGroup data", async () => {
      const result = await dbGetGroup({
        userGroupId: 777,
        session: "sess",
        requestId: "req",
      });

      expect(result).to.deep.equal({ id: 777 });
    });
  });
});
