const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//For these tests to work we need to export GetInventoryItemRestController also from file getinventoryitem.js
describe("GetInventoryItemRestController", () => {
  let GetInventoryItemRestController, getInventoryItem;
  let GetInventoryItemManagerStub, processRequestStub;
  let req, res, next;

  beforeEach(() => {
    req = { requestId: "req-456" };
    res = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub(),
    };
    next = sinon.stub();

    // Stub for GetInventoryItemManager constructor
    GetInventoryItemManagerStub = sinon.stub();

    // Stub for processRequest inherited from RestController
    processRequestStub = sinon.stub();

    // Proxyquire module under test with mocks
    ({ GetInventoryItemRestController, getInventoryItem } = proxyquire(
      "../../../src/controllers-layer/rest-layer/main/inventoryItem/get-inventoryitem.js",
      {
        serviceCommon: {
          HexaLogTypes: {},
          hexaLogger: { insertInfo: sinon.stub(), insertError: sinon.stub() },
        },
        managers: {
          GetInventoryItemManager: GetInventoryItemManagerStub,
        },
        "../../InventoryManagementServiceRestController": class {
          constructor(name, routeName, _req, _res, _next) {
            this.name = name;
            this.routeName = routeName;
            this._req = _req;
            this._res = _res;
            this._next = _next;
            this.processRequest = processRequestStub;
          }
        },
      },
    ));
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("GetInventoryItemRestController class", () => {
    it("should extend RestController with correct values", () => {
      const controller = new GetInventoryItemRestController(req, res, next);

      expect(controller.name).to.equal("getInventoryItem");
      expect(controller.routeName).to.equal("getinventoryitem");
      expect(controller.dataName).to.equal("inventoryItem");
      expect(controller.crudType).to.equal("get");
      expect(controller.status).to.equal(200);
      expect(controller.httpMethod).to.equal("GET");
    });

    it("should create GetInventoryItemManager in createApiManager()", () => {
      const controller = new GetInventoryItemRestController(req, res, next);
      controller._req = req;

      controller.createApiManager();

      expect(GetInventoryItemManagerStub.calledOnceWithExactly(req, "rest")).to
        .be.true;
    });
  });

  describe("getInventoryItem function", () => {
    it("should create instance and call processRequest", async () => {
      await getInventoryItem(req, res, next);

      expect(processRequestStub.calledOnce).to.be.true;
    });
  });
});
