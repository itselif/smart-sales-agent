const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//For these tests to work we need to export CreateUserRestController also from file createuser.js
describe("CreateUserRestController", () => {
  let CreateUserRestController, createUser;
  let CreateUserManagerStub, processRequestStub;
  let req, res, next;

  beforeEach(() => {
    req = { requestId: "req-456" };
    res = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub(),
    };
    next = sinon.stub();

    // Stub for CreateUserManager constructor
    CreateUserManagerStub = sinon.stub();

    // Stub for processRequest inherited from RestController
    processRequestStub = sinon.stub();

    // Proxyquire module under test with mocks
    ({ CreateUserRestController, createUser } = proxyquire(
      "../../../src/controllers-layer/rest-layer/main/user/create-user.js",
      {
        serviceCommon: {
          HexaLogTypes: {},
          hexaLogger: { insertInfo: sinon.stub(), insertError: sinon.stub() },
        },
        managers: {
          CreateUserManager: CreateUserManagerStub,
        },
        "../../AuthServiceRestController": class {
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

  describe("CreateUserRestController class", () => {
    it("should extend RestController with correct values", () => {
      const controller = new CreateUserRestController(req, res, next);

      expect(controller.name).to.equal("createUser");
      expect(controller.routeName).to.equal("createuser");
      expect(controller.dataName).to.equal("user");
      expect(controller.crudType).to.equal("create");
      expect(controller.status).to.equal(201);
      expect(controller.httpMethod).to.equal("POST");
    });

    it("should create CreateUserManager in createApiManager()", () => {
      const controller = new CreateUserRestController(req, res, next);
      controller._req = req;

      controller.createApiManager();

      expect(CreateUserManagerStub.calledOnceWithExactly(req, "rest")).to.be
        .true;
    });
  });

  describe("createUser function", () => {
    it("should create instance and call processRequest", async () => {
      await createUser(req, res, next);

      expect(processRequestStub.calledOnce).to.be.true;
    });
  });
});
