const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getIdListOfUserGroupByField module", () => {
  let sandbox;
  let getIdListOfUserGroupByField;
  let UserGroupStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    UserGroupStub = {
      findAll: sandbox.stub().resolves([{ id: "1" }, { id: "2" }]),
      groupName: "example-type",
    };

    getIdListOfUserGroupByField = proxyquire(
      "../../../../../src/db-layer/main/UserGroup/utils/getIdListOfUserGroupByField",
      {
        models: { UserGroup: UserGroupStub },
        common: {
          HttpServerError: class HttpServerError extends Error {
            constructor(msg, details) {
              super(msg);
              this.name = "HttpServerError";
              this.details = details;
            }
          },
          BadRequestError: class BadRequestError extends Error {
            constructor(msg) {
              super(msg);
              this.name = "BadRequestError";
            }
          },
          NotFoundError: class NotFoundError extends Error {
            constructor(msg) {
              super(msg);
              this.name = "NotFoundError";
            }
          },
        },
        sequelize: { Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getIdListOfUserGroupByField", () => {
    it("should return list of IDs when valid field and value is given", async () => {
      UserGroupStub["groupName"] = "string";
      const result = await getIdListOfUserGroupByField(
        "groupName",
        "test-value",
        false,
      );
      expect(result).to.deep.equal(["1", "2"]);
      sinon.assert.calledOnce(UserGroupStub.findAll);
    });

    it("should return list of IDs using Op.contains if isArray is true", async () => {
      UserGroupStub["groupName"] = "string";
      const result = await getIdListOfUserGroupByField(
        "groupName",
        "val",
        true,
      );
      const call = UserGroupStub.findAll.getCall(0);
      expect(call.args[0].where["groupName"][Op.contains]).to.include("val");
    });

    it("should throw BadRequestError if field name is invalid", async () => {
      try {
        await getIdListOfUserGroupByField("nonexistentField", "x", false);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field name");
      }
    });

    it("should throw BadRequestError if field value has wrong type", async () => {
      UserGroupStub["groupName"] = 123; // expects number

      try {
        await getIdListOfUserGroupByField("groupName", "wrong-type", false);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field value type");
      }
    });

    it("should throw NotFoundError if no records are found", async () => {
      UserGroupStub.findAll.resolves([]);
      UserGroupStub["groupName"] = "string";

      try {
        await getIdListOfUserGroupByField("groupName", "nomatch", false);
        throw new Error("Expected NotFoundError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("NotFoundError");
        expect(err.details.message).to.include(
          "UserGroup with the specified criteria not found",
        );
      }
    });

    it("should wrap findAll error in HttpServerError", async () => {
      UserGroupStub.findAll.rejects(new Error("query failed"));
      UserGroupStub["groupName"] = "string";

      try {
        await getIdListOfUserGroupByField("groupName", "test", false);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.message).to.equal("query failed");
      }
    });
  });
});
