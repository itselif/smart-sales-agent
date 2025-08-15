const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getIdListOfUserGroupMemberByField module", () => {
  let sandbox;
  let getIdListOfUserGroupMemberByField;
  let UserGroupMemberStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    UserGroupMemberStub = {
      findAll: sandbox.stub().resolves([{ id: "1" }, { id: "2" }]),
      groupId: "example-type",
    };

    getIdListOfUserGroupMemberByField = proxyquire(
      "../../../../../src/db-layer/main/UserGroupMember/utils/getIdListOfUserGroupMemberByField",
      {
        models: { UserGroupMember: UserGroupMemberStub },
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

  describe("getIdListOfUserGroupMemberByField", () => {
    it("should return list of IDs when valid field and value is given", async () => {
      UserGroupMemberStub["groupId"] = "string";
      const result = await getIdListOfUserGroupMemberByField(
        "groupId",
        "test-value",
        false,
      );
      expect(result).to.deep.equal(["1", "2"]);
      sinon.assert.calledOnce(UserGroupMemberStub.findAll);
    });

    it("should return list of IDs using Op.contains if isArray is true", async () => {
      UserGroupMemberStub["groupId"] = "string";
      const result = await getIdListOfUserGroupMemberByField(
        "groupId",
        "val",
        true,
      );
      const call = UserGroupMemberStub.findAll.getCall(0);
      expect(call.args[0].where["groupId"][Op.contains]).to.include("val");
    });

    it("should throw BadRequestError if field name is invalid", async () => {
      try {
        await getIdListOfUserGroupMemberByField("nonexistentField", "x", false);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field name");
      }
    });

    it("should throw BadRequestError if field value has wrong type", async () => {
      UserGroupMemberStub["groupId"] = 123; // expects number

      try {
        await getIdListOfUserGroupMemberByField("groupId", "wrong-type", false);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field value type");
      }
    });

    it("should throw NotFoundError if no records are found", async () => {
      UserGroupMemberStub.findAll.resolves([]);
      UserGroupMemberStub["groupId"] = "string";

      try {
        await getIdListOfUserGroupMemberByField("groupId", "nomatch", false);
        throw new Error("Expected NotFoundError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("NotFoundError");
        expect(err.details.message).to.include(
          "UserGroupMember with the specified criteria not found",
        );
      }
    });

    it("should wrap findAll error in HttpServerError", async () => {
      UserGroupMemberStub.findAll.rejects(new Error("query failed"));
      UserGroupMemberStub["groupId"] = "string";

      try {
        await getIdListOfUserGroupMemberByField("groupId", "test", false);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.message).to.equal("query failed");
      }
    });
  });
});
