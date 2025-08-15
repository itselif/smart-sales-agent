const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("CreateOpenApiSchema", () => {
  let ControllerClass;
  let req;

  beforeEach(() => {
    req = {
      inputData: {},
      body: {},
      query: {},
    };

    ControllerClass = proxyquire(
      "../../../../src/manager-layer/main/OpenApiSchema/create-openapischema",
      {
        "./OpenApiSchemaManager": class {
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

            this._storeId = "d26f6763-ee90-4f97-bd8a-c69fabdb4780";
          }
        },
      },
    );
  });

  it("should initialize controller with correct base properties", () => {
    const instance = new ControllerClass(req, "rest");
    expect(instance.options.name).to.equal("createOpenApiSchema");
    expect(instance.options.controllerType).to.equal("rest");
    expect(instance.options.crudType).to.equal("create");
    expect(instance.dataName).to.equal("openApiSchema");
  });

  it("should call readTenantId if tenant exists", () => {
    const instance = new ControllerClass(req, "rest");
    expect(instance.readTenantId.calledOnce).to.be.true;
  });

  it("should throw ForbiddenError if not in saas root tenant", () => {
    req.query["_storeId"] = "not-root";

    const ManagerStub = class {
      constructor() {
        this.readTenantId = function () {
          this._storeId = "not-root";
        };
        this.session = {};
      }
    };

    const ControllerClass = proxyquire(
      "../../../../src/manager-layer/main/OpenApiSchema/create-openapischema",
      {
        "./OpenApiSchemaManager": ManagerStub,
        common: {
          ForbiddenError: class ForbiddenError extends Error {
            constructor(msg) {
              super(msg);
              this.name = "ForbiddenError";
            }
          },
        },
      },
    );

    expect(() => new ControllerClass(req, "rest")).to.throw(
      "errMsg_thisRouteIsOpenOnlyInSaasLevel",
    );
  });
});

//// Other tests will be added later
