const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//For these tests to work we need to export GetStoreRestController also from file getstore.js
describe("GetStoreRestController", () => {
  let GetStoreRestController, getStore;
  let GetStoreManagerStub, processRequestStub;
  let req, res, next;

  beforeEach(() => {
    req = { requestId: "req-456" };
    res = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub(),
    };
    next = sinon.stub();

    // Stub for GetStoreManager constructor
    GetStoreManagerStub = sinon.stub();

    // Stub for processRequest inherited from RestController
    processRequestStub = sinon.stub();

    // Proxyquire module under test with mocks
    ({ GetStoreRestController, getStore } = proxyquire(
      "../../../src/controllers-layer/rest-layer/main/store/get-store.js",
      {
        serviceCommon: {
          HexaLogTypes: {},
          hexaLogger: { insertInfo: sinon.stub(), insertError: sinon.stub() },
        },
        managers: {
          GetStoreManager: GetStoreManagerStub,
        },
        "../../StoreManagementServiceRestController": class {
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

  describe("GetStoreRestController class", () => {
    it("should extend RestController with correct values", () => {
      const controller = new GetStoreRestController(req, res, next);

      expect(controller.name).to.equal("getStore");
      expect(controller.routeName).to.equal("getstore");
      expect(controller.dataName).to.equal("store");
      expect(controller.crudType).to.equal("get");
      expect(controller.status).to.equal(200);
      expect(controller.httpMethod).to.equal("GET");
    });

    it("should create GetStoreManager in createApiManager()", () => {
      const controller = new GetStoreRestController(req, res, next);
      controller._req = req;

      controller.createApiManager();

      expect(GetStoreManagerStub.calledOnceWithExactly(req, "rest")).to.be.true;
    });
  });

  describe("getStore function", () => {
    it("should create instance and call processRequest", async () => {
      await getStore(req, res, next);

      expect(processRequestStub.calledOnce).to.be.true;
    });
  });
});
