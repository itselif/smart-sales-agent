const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//For these tests to work we need to export CreateUserGrpcController also from file createUser.js
describe("CreateUserGrpcController", () => {
  let CreateUserGrpcController, createUser;
  let CreateUserManagerStub, processRequestStub;
  let call, callback;

  beforeEach(() => {
    call = { request: { userId: "user-123" } };
    callback = sinon.stub();

    CreateUserManagerStub = sinon.stub();

    processRequestStub = sinon.stub();

    ({ CreateUserGrpcController, createUser } = proxyquire(
      "../../../src/controllers-layer/grpc-layer/create-user",
      {
        managers: {
          CreateUserManager: CreateUserManagerStub,
        },
        "../../../src/controllers-layer/grpc-layer/AuthServiceGrpcController": class {
          constructor(name, routeName, _call, _callback) {
            this.name = name;
            this.routeName = routeName;
            this._call = _call;
            this._callback = _callback;
            this.request = _call.request;
            this.processRequest = processRequestStub;
          }
        },
      },
    ));
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("CreateUserGrpcController class", () => {
    it("should extend GrpcController with correct values", () => {
      const controller = new CreateUserGrpcController(call, callback);

      expect(controller.name).to.equal("createUser");
      expect(controller.routeName).to.equal("createuser");
      expect(controller.crudType).to.equal("create");
    });

    it("should create CreateUserManager in createApiManager()", async () => {
      const controller = new CreateUserGrpcController(call, callback);
      await controller.createApiManager();

      expect(CreateUserManagerStub.calledOnceWithExactly(call.request, "grpc"))
        .to.be.true;
    });
  });

  describe("createUser function", () => {
    it("should create instance and call processRequest", async () => {
      await createUser(call, callback);
      expect(processRequestStub.calledOnce).to.be.true;
    });

    it("should call callback with error if something fails", async () => {
      const error = new Error("Boom");

      const BrokenController = class {
        constructor() {
          throw error;
        }
      };

      ({ createUser } = proxyquire(
        "../../../src/controllers-layer/grpc-layer/create-user",
        {
          managers: { CreateUserManager: CreateUserManagerStub },
          "../../../src/controllers-layer/grpc-layer/AuthServiceGrpcController":
            BrokenController,
        },
      ));

      await createUser(call, callback);

      expect(callback.calledOnce).to.be.true;
      const [grpcError] = callback.firstCall.args;
      expect(grpcError.message).to.equal("Boom");
    });
  });
});
