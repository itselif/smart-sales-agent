const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("createLowStockAlert module", () => {
  let sandbox;
  let createLowStockAlert;
  let LowStockAlertStub, ElasticIndexerStub, newUUIDStub;

  const fakeId = "uuid-123";
  const baseValidInput = {
    inventoryItemId: "inventoryItemId_val",
    alertType: "alertType_val",
    alertTimestamp: "alertTimestamp_val",
    storeId: "storeId_val",
  };
  const mockCreatedLowStockAlert = {
    getData: () => ({ id: fakeId, ...baseValidInput }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    LowStockAlertStub = {
      create: sandbox.stub().resolves(mockCreatedLowStockAlert),
    };

    ElasticIndexerStub = sandbox.stub().returns({
      indexData: sandbox.stub().resolves(),
    });

    newUUIDStub = sandbox.stub().returns(fakeId);

    createLowStockAlert = proxyquire(
      "../../../../../src/db-layer/main/LowStockAlert/utils/createLowStockAlert",
      {
        models: { LowStockAlert: LowStockAlertStub },
        serviceCommon: { ElasticIndexer: ElasticIndexerStub },
        common: {
          HttpServerError: class HttpServerError extends Error {
            constructor(msg, details) {
              super(msg);
              this.name = "HttpServerError";
              this.details = details;
            }
          },
          BadRequestError: class BadRequestError extends Error {
            constructor(msg) {
              super(msg);
              this.name = "BadRequestError";
            }
          },
          newUUID: newUUIDStub,
        },
      },
    );
  });

  afterEach(() => sandbox.restore());

  const getValidInput = (overrides = {}) => ({
    ...baseValidInput,
    ...overrides,
  });

  describe("createLowStockAlert", () => {
    it("should create LowStockAlert and index to elastic if valid data", async () => {
      const input = getValidInput();
      const result = await createLowStockAlert(input);

      expect(result).to.deep.equal({ id: fakeId, ...baseValidInput });
      sinon.assert.calledOnce(LowStockAlertStub.create);
      sinon.assert.calledOnce(ElasticIndexerStub);
    });

    it("should throw HttpServerError if LowStockAlert.create fails", async () => {
      LowStockAlertStub.create.rejects(new Error("DB error"));
      const input = getValidInput();

      try {
        await createLowStockAlert(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal("errMsg_dbErrorWhenCreatingLowStockAlert");
        expect(err.details.message).to.equal("DB error");
      }
    });
  });

  describe("validateData", () => {
    it("should generate new UUID if id is not provided", async () => {
      const input = getValidInput();
      delete input.id;
      await createLowStockAlert(input);
      sinon.assert.calledOnce(newUUIDStub);
    });

    it("should use provided id if present", async () => {
      const input = getValidInput({ id: "existing-id" });
      await createLowStockAlert(input);
      sinon.assert.notCalled(newUUIDStub);
      sinon.assert.calledWith(
        LowStockAlertStub.create,
        sinon.match({ id: "existing-id" }),
      );
    });

    it("should not throw if requiredFields is satisfied", async () => {
      const input = getValidInput();
      await createLowStockAlert(input);
    });

    it("should not overwrite id if already present", async () => {
      const input = getValidInput({ id: "custom-id" });
      await createLowStockAlert(input);
      sinon.assert.notCalled(newUUIDStub);
      sinon.assert.calledWith(
        LowStockAlertStub.create,
        sinon.match({ id: "custom-id" }),
      );
    });

    it("should throw BadRequestError if required field is missing", async () => {
      const input = getValidInput();
      delete input["inventoryItemId"];
      try {
        await createLowStockAlert(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include(
          'Field "inventoryItemId" is required',
        );
      }
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer with lowStockAlert data", async () => {
      const input = getValidInput();
      await createLowStockAlert(input);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });

    it("should throw HttpServerError if ElasticIndexer.indexData fails", async () => {
      ElasticIndexerStub().indexData.rejects(new Error("Elastic error"));
      const input = getValidInput();

      try {
        await createLowStockAlert(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal("errMsg_dbErrorWhenCreatingLowStockAlert");
        expect(err.details.message).to.equal("Elastic error");
      }
    });
  });
});
