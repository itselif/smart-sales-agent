const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("InventoryManagementServiceManager", () => {
  let InventoryManagementServiceManager;
  let ApiManagerMock;

  beforeEach(() => {
    ApiManagerMock = class {
      constructor(req, opts) {
        this.request = req;
        this.options = opts;
        this.auth = req.auth;
      }

      parametersToJson(jsonObj) {
        jsonObj._base = true;
      }
    };

    InventoryManagementServiceManager = proxyquire(
      "../../../src/manager-layer/service-manager/InventoryManagementServiceManager",
      {
        "./ApiManager": ApiManagerMock,
      },
    );
  });

  describe("readTenantId()", () => {
    it("should read _storeId from query if present", () => {
      const req = { query: { _storeId: "abc-123" }, headers: {} };
      const manager = new InventoryManagementServiceManager(req, {});
      manager.readTenantId(req);

      expect(manager._storeId).to.equal("abc-123");
      expect(manager.storeId).to.equal("abc-123");
      expect(req.storeId).to.equal("abc-123");
    });

    it("should fallback to header  if _storeId not in query", () => {
      const req = { query: {}, headers: { "": "header-xyz" } };
      const manager = new InventoryManagementServiceManager(req, {});
      manager.readTenantId(req);

      expect(manager._storeId).to.equal("header-xyz");
      expect(manager.storeId).to.equal("header-xyz");
    });

    it("should use rootStoreId if neither query nor header are present", () => {
      const req = { query: {}, headers: {} };
      const manager = new InventoryManagementServiceManager(req, {});
      manager.readTenantId(req);

      expect(manager._storeId).to.equal("d26f6763-ee90-4f97-bd8a-c69fabdb4780");
      expect(manager.storeId).to.equal("d26f6763-ee90-4f97-bd8a-c69fabdb4780");
    });
  });

  describe("parametersToJson()", () => {
    it("should add storeId to JSON", () => {
      const req = { query: {}, headers: {} };
      const manager = new InventoryManagementServiceManager(req, {});
      manager.storeId = "test-client";

      const jsonObj = {};
      manager.parametersToJson(jsonObj);

      expect(jsonObj._base).to.be.true;
      expect(jsonObj.storeId).to.equal("test-client");
    });
  });

  describe("userHasRole()", () => {
    it("should return true if userHasRole returns true", () => {
      const req = {
        auth: {
          userHasRole: sinon.stub().withArgs("admin").returns(true),
        },
      };
      const manager = new InventoryManagementServiceManager(req, {});
      expect(manager.userHasRole("admin")).to.be.true;
    });

    it("should return false if no auth", () => {
      const manager = new InventoryManagementServiceManager({}, {});
      expect(manager.userHasRole("admin")).to.be.false;
    });
  });
});
