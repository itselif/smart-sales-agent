const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//For these tests to work we need to export GetAuditLogRestController also from file getauditlog.js
describe("GetAuditLogRestController", () => {
  let GetAuditLogRestController, getAuditLog;
  let GetAuditLogManagerStub, processRequestStub;
  let req, res, next;

  beforeEach(() => {
    req = { requestId: "req-456" };
    res = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub(),
    };
    next = sinon.stub();

    // Stub for GetAuditLogManager constructor
    GetAuditLogManagerStub = sinon.stub();

    // Stub for processRequest inherited from RestController
    processRequestStub = sinon.stub();

    // Proxyquire module under test with mocks
    ({ GetAuditLogRestController, getAuditLog } = proxyquire(
      "../../../src/controllers-layer/rest-layer/main/auditLog/get-auditlog.js",
      {
        serviceCommon: {
          HexaLogTypes: {},
          hexaLogger: { insertInfo: sinon.stub(), insertError: sinon.stub() },
        },
        managers: {
          GetAuditLogManager: GetAuditLogManagerStub,
        },
        "../../ObservabilityServiceRestController": class {
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

  describe("GetAuditLogRestController class", () => {
    it("should extend RestController with correct values", () => {
      const controller = new GetAuditLogRestController(req, res, next);

      expect(controller.name).to.equal("getAuditLog");
      expect(controller.routeName).to.equal("getauditlog");
      expect(controller.dataName).to.equal("auditLog");
      expect(controller.crudType).to.equal("get");
      expect(controller.status).to.equal(200);
      expect(controller.httpMethod).to.equal("GET");
    });

    it("should create GetAuditLogManager in createApiManager()", () => {
      const controller = new GetAuditLogRestController(req, res, next);
      controller._req = req;

      controller.createApiManager();

      expect(GetAuditLogManagerStub.calledOnceWithExactly(req, "rest")).to.be
        .true;
    });
  });

  describe("getAuditLog function", () => {
    it("should create instance and call processRequest", async () => {
      await getAuditLog(req, res, next);

      expect(processRequestStub.calledOnce).to.be.true;
    });
  });
});
