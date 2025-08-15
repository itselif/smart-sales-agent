const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("SaleTransactionHistoryManager", () => {
  let ManagerClass;
  let manager;
  let req;

  beforeEach(() => {
    req = {
      session: {
        _USERID: "u1",
        fullname: "Test User",
        name: "Test",
        surname: "User",
        email: "test@example.com",
      },
    };
    ManagerClass = proxyquire(
      "../../../../src/manager-layer/main/SaleTransactionHistory/SaleTransactionHistoryManager",
      {
        "../../service-manager/SalesManagementServiceManager": class {
          constructor() {
            this.session = req.session;
            this.bodyParams = {};
          }
          toJSON() {
            return {};
          }
        },
      },
    );
    manager = new ManagerClass(req);
  });

  describe("constructor", () => {
    it("should initialize properties correctly", () => {
      const ManagerClass = proxyquire(
        "../../../../src/manager-layer/main/SaleTransactionHistory/SaleTransactionHistoryManager",
        {
          "../../service-manager/SalesManagementServiceManager": class {
            constructor(request, options) {
              this.session = request.session;
              this.bodyParams = {};
            }
          },
        },
      );

      const req = {
        session: {
          _USERID: "u1",
          fullname: "Test User",
          name: "Test",
          surname: "User",
          email: "test@example.com",
        },
      };

      const instance = new ManagerClass(req);
      expect(instance).to.have.property("objectName", "saleTransactionHistory");
      expect(instance).to.have.property("modelName", "SaleTransactionHistory");
      expect(instance.session).to.equal(req.session);
    });
  });
});
