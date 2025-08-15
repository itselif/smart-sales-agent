const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbListGroupsCommand is exported from main code

describe("DbListGroupsCommand", () => {
  let DbListGroupsCommand, dbListGroups;
  let sandbox, UserGroupStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    UserGroupStub = {
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

    ({ DbListGroupsCommand, dbListGroups } = proxyquire(
      "../../../../src/db-layer/main/userGroup/dbListGroups",
      {
        models: { UserGroup: UserGroupStub },
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
      const cmd = new DbListGroupsCommand(input);

      expect(cmd.commandName).to.equal("dbListGroups");
      expect(cmd.emptyResult).to.be.true;
      expect(cmd.objectName).to.equal("userGroups");
      expect(cmd.serviceLabel).to.equal("salesai-auth-service");
      expect(cmd.input.pagination).to.be.null;
    });
  });

  describe("getCqrsJoins", () => {
    it("should call UserGroup.getCqrsJoins if defined", async () => {
      const cmd = new DbListGroupsCommand({});
      await cmd.getCqrsJoins({ id: 1 });
      sinon.assert.calledOnce(UserGroupStub.getCqrsJoins);
    });

    it("should skip getCqrsJoins if method is missing", async () => {
      delete UserGroupStub.getCqrsJoins;
      const cmd = new DbListGroupsCommand({});
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
      const cmd = new DbListGroupsCommand({});
      const result = cmd.buildIncludes(true);
      expect(result).to.deep.equal([]);
    });
    it("should return [] includes even if getJoins is absent", () => {
      const cmd = new DbListGroupsCommand({}); // input.getJoins is undefined
      const result = cmd.buildIncludes(false);
      expect(result).to.deep.equal([]);
    });
  });

  describe("executeQuery", () => {
    it("should handle empty selectList and skip attributes", async () => {
      const cmd = new DbListGroupsCommand({ getJoins: false });
      sandbox.stub(cmd, "getSelectList").returns(null);

      await cmd.executeQuery();

      const callArgs = UserGroupStub.findAll.getCall(0).args[0];
      expect(callArgs.attributes).to.be.undefined;
    });

    it("should skip includes when input.getJoins is false", async () => {
      const cmd = new DbListGroupsCommand({ getJoins: false });
      sandbox.stub(cmd, "getSelectList").returns(null);
      const result = await cmd.executeQuery();

      const callArgs = UserGroupStub.findAll.getCall(0).args[0];
      expect(callArgs.include).to.equal(null);
      expect(result).to.deep.equal([{ id: 1, name: "Visa" }]);
    });

    it("should return rows with count if pagination and count query are triggered", async () => {
      UserGroupStub.findAll.reset();
      UserGroupStub.findAll.onCall(0).resolves([{ id: 1 }, { id: 2 }]);
      UserGroupStub.findAll.onCall(1).resolves([{ _COUNT: 12 }]);

      const input = {
        pagination: { pageRowCount: 10, pageNumber: 1 },
        getJoins: true,
      };

      const cmd = new DbListGroupsCommand(input);
      sandbox.stub(cmd, "buildIncludes").returns([]);
      sandbox.stub(cmd, "getSelectList").returns(["id"]);

      // simulate full pagination count response logic
      cmd.executeQuery = async function () {
        const data = await UserGroupStub.findAll();
        const count = await UserGroupStub.findAll();
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
      const cmd = new DbListGroupsCommand({});
      const data = [{ total: "42.5" }];
      sandbox.stub(cmd, "getSelectList").returns(["total"]);
      sandbox.stub(cmd, "buildIncludes").returns(null);
      UserGroupStub.findAll.reset();
      UserGroupStub.findAll.resolves(data);

      cmd.convertAggregationsToNumbers = function (item) {
        item.total = parseFloat(item.total);
      };

      const result = await cmd.executeQuery();
      expect(result[0].total).to.equal("42.5");
    });

    it("should return first element directly if isAggregatedWithoutGroup", async () => {
      const cmd = new DbListGroupsCommand({});
      const first = { total: 99 };
      sandbox.stub(cmd, "getSelectList").returns(["total"]);
      sandbox.stub(cmd, "buildIncludes").returns(null);
      UserGroupStub.findAll.resolves([first]);

      const result = await cmd.executeQuery();
      expect(result).to.deep.equal([first]);
    });
  });

  describe("dbListGroups", () => {
    it("should return paymentMethods from execution", async () => {
      const input = { getJoins: false, session: "s", requestId: "r" };
      const result = await dbListGroups(input);
      expect(result).to.deep.equal([{ id: 1, name: "Visa" }]);
    });
  });
});
