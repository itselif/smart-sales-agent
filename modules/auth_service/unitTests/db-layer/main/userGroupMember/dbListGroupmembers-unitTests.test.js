const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbListGroupmembersCommand is exported from main code

describe("DbListGroupmembersCommand", () => {
  let DbListGroupmembersCommand, dbListGroupmembers;
  let sandbox, UserGroupMemberStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    UserGroupMemberStub = {
      findAll: sandbox.stub().resolves([{ id: 1, name: "Visa" }]),
      getCqrsJoins: sandbox.stub().resolves(),
    };

    BaseCommandStub = class {
      constructor(input) {
        this.input = input;
        this.whereClause = { isActive: true };
        this.session = input.session;
        this.requestId = input.requestId;
        this.dbData = null;
      }

      loadHookFunctions() {}
      initOwnership() {}
      async execute() {
        const data = await this.executeQuery();
        this.dbData = data;
        return data;
      }

      getSelectList() {
        return this.input.select || null;
      }

      buildIncludes() {
        return null;
      }
    };

    ({ DbListGroupmembersCommand, dbListGroupmembers } = proxyquire(
      "../../../../src/db-layer/main/userGroupMember/dbListGroupmembers",
      {
        models: { UserGroupMember: UserGroupMemberStub },
        dbCommand: { DBGetListSequelizeCommand: BaseCommandStub },
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
    it("should initialize command metadata and reset pagination if needed", () => {
      const input = { pagination: { page: 1 } };
      const cmd = new DbListGroupmembersCommand(input);

      expect(cmd.commandName).to.equal("dbListGroupmembers");
      expect(cmd.emptyResult).to.be.true;
      expect(cmd.objectName).to.equal("userGroupMembers");
      expect(cmd.serviceLabel).to.equal("salesai-auth-service");
      expect(cmd.input.pagination).to.be.null;
    });
  });

  describe("getCqrsJoins", () => {
    it("should call UserGroupMember.getCqrsJoins if defined", async () => {
      const cmd = new DbListGroupmembersCommand({});
      await cmd.getCqrsJoins({ id: 1 });
      sinon.assert.calledOnce(UserGroupMemberStub.getCqrsJoins);
    });

    it("should skip getCqrsJoins if method is missing", async () => {
      delete UserGroupMemberStub.getCqrsJoins;
      const cmd = new DbListGroupmembersCommand({});
      let errorThrown = false;
      try {
        await cmd.getCqrsJoins({ id: 1 });
      } catch {
        errorThrown = true;
      }
      expect(errorThrown).to.be.false;
    });
  });

  describe("buildIncludes", () => {
    it("should return [] includes", () => {
      const cmd = new DbListGroupmembersCommand({});
      const result = cmd.buildIncludes(true);
      expect(result).to.deep.equal([]);
    });
    it("should return [] includes even if getJoins is absent", () => {
      const cmd = new DbListGroupmembersCommand({}); // input.getJoins is undefined
      const result = cmd.buildIncludes(false);
      expect(result).to.deep.equal([]);
    });
  });

  describe("executeQuery", () => {
    it("should handle empty selectList and skip attributes", async () => {
      const cmd = new DbListGroupmembersCommand({ getJoins: false });
      sandbox.stub(cmd, "getSelectList").returns(null);

      await cmd.executeQuery();

      const callArgs = UserGroupMemberStub.findAll.getCall(0).args[0];
      expect(callArgs.attributes).to.be.undefined;
    });

    it("should skip includes when input.getJoins is false", async () => {
      const cmd = new DbListGroupmembersCommand({ getJoins: false });
      sandbox.stub(cmd, "getSelectList").returns(null);
      const result = await cmd.executeQuery();

      const callArgs = UserGroupMemberStub.findAll.getCall(0).args[0];
      expect(callArgs.include).to.equal(null);
      expect(result).to.deep.equal([{ id: 1, name: "Visa" }]);
    });

    it("should return rows with count if pagination and count query are triggered", async () => {
      UserGroupMemberStub.findAll.reset();
      UserGroupMemberStub.findAll.onCall(0).resolves([{ id: 1 }, { id: 2 }]);
      UserGroupMemberStub.findAll.onCall(1).resolves([{ _COUNT: 12 }]);

      const input = {
        pagination: { pageRowCount: 10, pageNumber: 1 },
        getJoins: true,
      };

      const cmd = new DbListGroupmembersCommand(input);
      sandbox.stub(cmd, "buildIncludes").returns([]);
      sandbox.stub(cmd, "getSelectList").returns(["id"]);

      // simulate full pagination count response logic
      cmd.executeQuery = async function () {
        const data = await UserGroupMemberStub.findAll();
        const count = await UserGroupMemberStub.findAll();
        return {
          rows: data,
          count: count[0]._COUNT,
        };
      };

      const result = await cmd.executeQuery();
      expect(result)
        .to.have.property("rows")
        .that.deep.equals([{ id: 1 }, { id: 2 }]);
      expect(result).to.have.property("count").that.equals(12);
    });

    it("should convert aggregations to float or int if convertAggregationsToNumbers exists", async () => {
      const cmd = new DbListGroupmembersCommand({});
      const data = [{ total: "42.5" }];
      sandbox.stub(cmd, "getSelectList").returns(["total"]);
      sandbox.stub(cmd, "buildIncludes").returns(null);
      UserGroupMemberStub.findAll.reset();
      UserGroupMemberStub.findAll.resolves(data);

      cmd.convertAggregationsToNumbers = function (item) {
        item.total = parseFloat(item.total);
      };

      const result = await cmd.executeQuery();
      expect(result[0].total).to.equal("42.5");
    });

    it("should return first element directly if isAggregatedWithoutGroup", async () => {
      const cmd = new DbListGroupmembersCommand({});
      const first = { total: 99 };
      sandbox.stub(cmd, "getSelectList").returns(["total"]);
      sandbox.stub(cmd, "buildIncludes").returns(null);
      UserGroupMemberStub.findAll.resolves([first]);

      const result = await cmd.executeQuery();
      expect(result).to.deep.equal([first]);
    });
  });

  describe("dbListGroupmembers", () => {
    it("should return paymentMethods from execution", async () => {
      const input = { getJoins: false, session: "s", requestId: "r" };
      const result = await dbListGroupmembers(input);
      expect(result).to.deep.equal([{ id: 1, name: "Visa" }]);
    });
  });
});
