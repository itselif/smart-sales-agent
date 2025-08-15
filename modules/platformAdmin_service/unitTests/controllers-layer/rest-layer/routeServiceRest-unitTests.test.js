const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//For these tests to work we need to export GetOpenApiSchemaRestController also from file getopenapischema.js
describe("GetOpenApiSchemaRestController", () => {
  let GetOpenApiSchemaRestController, getOpenApiSchema;
  let GetOpenApiSchemaManagerStub, processRequestStub;
  let req, res, next;

  beforeEach(() => {
    req = { requestId: "req-456" };
    res = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub(),
    };
    next = sinon.stub();

    // Stub for GetOpenApiSchemaManager constructor
    GetOpenApiSchemaManagerStub = sinon.stub();

    // Stub for processRequest inherited from RestController
    processRequestStub = sinon.stub();

    // Proxyquire module under test with mocks
    ({ GetOpenApiSchemaRestController, getOpenApiSchema } = proxyquire(
      "../../../src/controllers-layer/rest-layer/main/openApiSchema/get-openapischema.js",
      {
        serviceCommon: {
          HexaLogTypes: {},
          hexaLogger: { insertInfo: sinon.stub(), insertError: sinon.stub() },
        },
        managers: {
          GetOpenApiSchemaManager: GetOpenApiSchemaManagerStub,
        },
        "../../PlatformAdminServiceRestController": class {
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

  describe("GetOpenApiSchemaRestController class", () => {
    it("should extend RestController with correct values", () => {
      const controller = new GetOpenApiSchemaRestController(req, res, next);

      expect(controller.name).to.equal("getOpenApiSchema");
      expect(controller.routeName).to.equal("getopenapischema");
      expect(controller.dataName).to.equal("openApiSchema");
      expect(controller.crudType).to.equal("get");
      expect(controller.status).to.equal(200);
      expect(controller.httpMethod).to.equal("GET");
    });

    it("should create GetOpenApiSchemaManager in createApiManager()", () => {
      const controller = new GetOpenApiSchemaRestController(req, res, next);
      controller._req = req;

      controller.createApiManager();

      expect(GetOpenApiSchemaManagerStub.calledOnceWithExactly(req, "rest")).to
        .be.true;
    });
  });

  describe("getOpenApiSchema function", () => {
    it("should create instance and call processRequest", async () => {
      await getOpenApiSchema(req, res, next);

      expect(processRequestStub.calledOnce).to.be.true;
    });
  });
});
