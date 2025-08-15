const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbGetGroupmemberCommand is exported from main code

describe("DbGetGroupmemberCommand", () => {
  let DbGetGroupmemberCommand, dbGetGroupmember;
  let sandbox, UserGroupMemberStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    UserGroupMemberStub = {
      getCqrsJoins: sandbox.stub().resolves(),
    };

    BaseCommandStub = class {
      constructor(input, model) {
        this.input = input;
        this.model = model;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.userGroupMemberId || 101 };
      }

      async execute() {
        return this.dbData;
      }

      loadHookFunctions() {}
      initOwnership() {}
      createEntityCacher() {}
    };

    ({ DbGetGroupmemberCommand, dbGetGroupmember } = proxyquire(
      "../../../../src/db-layer/main/userGroupMember/dbGetGroupmember",
      {
        models: { UserGroupMember: UserGroupMemberStub },
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
      const cmd = new DbGetGroupmemberCommand({});
      expect(cmd.commandName).to.equal("dbGetGroupmember");
      expect(cmd.objectName).to.equal("userGroupMember");
      expect(cmd.serviceLabel).to.equal("salesai-auth-service");
      expect(cmd.nullResult).to.be.false;
    });
  });

  describe("getCqrsJoins", () => {
    it("should call UserGroupMember.getCqrsJoins if exists", async () => {
      const cmd = new DbGetGroupmemberCommand({});
      await cmd.getCqrsJoins({ test: true });
      sinon.assert.calledOnce(UserGroupMemberStub.getCqrsJoins);
    });

    it("should skip getCqrsJoins if method is missing", async () => {
      delete UserGroupMemberStub.getCqrsJoins;
      const cmd = new DbGetGroupmemberCommand({});
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
      const cmd = new DbGetGroupmemberCommand({});
      const result = cmd.buildIncludes(true);
      expect(result).to.deep.equal([]);
    });

    it("should return [] includes even if getJoins is absent", () => {
      const cmd = new DbGetGroupmemberCommand({}); // input.getJoins is undefined
      const result = cmd.buildIncludes(false);
      expect(result).to.deep.equal([]);
    });
  });

  describe("dbGetGroupmember", () => {
    it("should execute dbGetGroupmember and return userGroupMember data", async () => {
      const result = await dbGetGroupmember({
        userGroupMemberId: 777,
        session: "sess",
        requestId: "req",
      });

      expect(result).to.deep.equal({ id: 777 });
    });
  });
});
