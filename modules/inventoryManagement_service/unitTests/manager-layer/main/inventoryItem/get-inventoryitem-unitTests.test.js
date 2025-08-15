const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("GetInventoryItem", () => {
  let ControllerClass;
  let req;

  beforeEach(() => {
    req = {
      inputData: {},
      body: {},
      query: {},
    };

    ControllerClass = proxyquire(
      "../../../../src/manager-layer/main/InventoryItem/get-inventoryitem",
      {
        "./InventoryItemManager": class {
          constructor(request, options) {
            this.request = request;
            this.options = options;
            this.session = {
              _USERID: "u1",
              email: "a@b.com",
              fullname: "Test User",
            };
            this.bodyParams = {};
            this.readTenantId = sinon.stub();
          }
        },
      },
    );
  });

  it("should initialize controller with correct base properties", () => {
    const instance = new ControllerClass(req, "rest");
    expect(instance.options.name).to.equal("getInventoryItem");
    expect(instance.options.controllerType).to.equal("rest");
    expect(instance.options.crudType).to.equal("get");
    expect(instance.dataName).to.equal("inventoryItem");
  });

  it("should call readTenantId if tenant exists", () => {
    const instance = new ControllerClass(req, "rest");
    expect(instance.readTenantId.calledOnce).to.be.true;
  });
});

//// Other tests will be added later
