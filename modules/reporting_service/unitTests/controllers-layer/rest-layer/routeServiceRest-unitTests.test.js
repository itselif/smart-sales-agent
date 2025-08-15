const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//For these tests to work we need to export GetReportRequestRestController also from file getreportrequest.js
describe("GetReportRequestRestController", () => {
  let GetReportRequestRestController, getReportRequest;
  let GetReportRequestManagerStub, processRequestStub;
  let req, res, next;

  beforeEach(() => {
    req = { requestId: "req-456" };
    res = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub(),
    };
    next = sinon.stub();

    // Stub for GetReportRequestManager constructor
    GetReportRequestManagerStub = sinon.stub();

    // Stub for processRequest inherited from RestController
    processRequestStub = sinon.stub();

    // Proxyquire module under test with mocks
    ({ GetReportRequestRestController, getReportRequest } = proxyquire(
      "../../../src/controllers-layer/rest-layer/main/reportRequest/get-reportrequest.js",
      {
        serviceCommon: {
          HexaLogTypes: {},
          hexaLogger: { insertInfo: sinon.stub(), insertError: sinon.stub() },
        },
        managers: {
          GetReportRequestManager: GetReportRequestManagerStub,
        },
        "../../ReportingServiceRestController": class {
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

  describe("GetReportRequestRestController class", () => {
    it("should extend RestController with correct values", () => {
      const controller = new GetReportRequestRestController(req, res, next);

      expect(controller.name).to.equal("getReportRequest");
      expect(controller.routeName).to.equal("getreportrequest");
      expect(controller.dataName).to.equal("reportRequest");
      expect(controller.crudType).to.equal("get");
      expect(controller.status).to.equal(200);
      expect(controller.httpMethod).to.equal("GET");
    });

    it("should create GetReportRequestManager in createApiManager()", () => {
      const controller = new GetReportRequestRestController(req, res, next);
      controller._req = req;

      controller.createApiManager();

      expect(GetReportRequestManagerStub.calledOnceWithExactly(req, "rest")).to
        .be.true;
    });
  });

  describe("getReportRequest function", () => {
    it("should create instance and call processRequest", async () => {
      await getReportRequest(req, res, next);

      expect(processRequestStub.calledOnce).to.be.true;
    });
  });
});
