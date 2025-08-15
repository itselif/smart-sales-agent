const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//For these tests to work we need to export GetSaleTransactionRestController also from file getsaletransaction.js
describe("GetSaleTransactionRestController", () => {
  let GetSaleTransactionRestController, getSaleTransaction;
  let GetSaleTransactionManagerStub, processRequestStub;
  let req, res, next;

  beforeEach(() => {
    req = { requestId: "req-456" };
    res = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub(),
    };
    next = sinon.stub();

    // Stub for GetSaleTransactionManager constructor
    GetSaleTransactionManagerStub = sinon.stub();

    // Stub for processRequest inherited from RestController
    processRequestStub = sinon.stub();

    // Proxyquire module under test with mocks
    ({ GetSaleTransactionRestController, getSaleTransaction } = proxyquire(
      "../../../src/controllers-layer/rest-layer/main/saleTransaction/get-saletransaction.js",
      {
        serviceCommon: {
          HexaLogTypes: {},
          hexaLogger: { insertInfo: sinon.stub(), insertError: sinon.stub() },
        },
        managers: {
          GetSaleTransactionManager: GetSaleTransactionManagerStub,
        },
        "../../SalesManagementServiceRestController": class {
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

  describe("GetSaleTransactionRestController class", () => {
    it("should extend RestController with correct values", () => {
      const controller = new GetSaleTransactionRestController(req, res, next);

      expect(controller.name).to.equal("getSaleTransaction");
      expect(controller.routeName).to.equal("getsaletransaction");
      expect(controller.dataName).to.equal("saleTransaction");
      expect(controller.crudType).to.equal("get");
      expect(controller.status).to.equal(200);
      expect(controller.httpMethod).to.equal("GET");
    });

    it("should create GetSaleTransactionManager in createApiManager()", () => {
      const controller = new GetSaleTransactionRestController(req, res, next);
      controller._req = req;

      controller.createApiManager();

      expect(GetSaleTransactionManagerStub.calledOnceWithExactly(req, "rest"))
        .to.be.true;
    });
  });

  describe("getSaleTransaction function", () => {
    it("should create instance and call processRequest", async () => {
      await getSaleTransaction(req, res, next);

      expect(processRequestStub.calledOnce).to.be.true;
    });
  });
});
