const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("createStoreAssignment module", () => {
  let sandbox;
  let createStoreAssignment;
  let StoreAssignmentStub, ElasticIndexerStub, newUUIDStub;

  const fakeId = "uuid-123";
  const baseValidInput = {
    userId: "userId_val",
    storeId: "storeId_val",
    role: "role_val",
    assignmentType: "assignmentType_val",
    status: "status_val",
  };
  const mockCreatedStoreAssignment = {
    getData: () => ({ id: fakeId, ...baseValidInput }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    StoreAssignmentStub = {
      create: sandbox.stub().resolves(mockCreatedStoreAssignment),
    };

    ElasticIndexerStub = sandbox.stub().returns({
      indexData: sandbox.stub().resolves(),
    });

    newUUIDStub = sandbox.stub().returns(fakeId);

    createStoreAssignment = proxyquire(
      "../../../../../src/db-layer/main/StoreAssignment/utils/createStoreAssignment",
      {
        models: { StoreAssignment: StoreAssignmentStub },
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

  describe("createStoreAssignment", () => {
    it("should create StoreAssignment and index to elastic if valid data", async () => {
      const input = getValidInput();
      const result = await createStoreAssignment(input);

      expect(result).to.deep.equal({ id: fakeId, ...baseValidInput });
      sinon.assert.calledOnce(StoreAssignmentStub.create);
      sinon.assert.calledOnce(ElasticIndexerStub);
    });

    it("should throw HttpServerError if StoreAssignment.create fails", async () => {
      StoreAssignmentStub.create.rejects(new Error("DB error"));
      const input = getValidInput();

      try {
        await createStoreAssignment(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenCreatingStoreAssignment",
        );
        expect(err.details.message).to.equal("DB error");
      }
    });
  });

  describe("validateData", () => {
    it("should generate new UUID if id is not provided", async () => {
      const input = getValidInput();
      delete input.id;
      await createStoreAssignment(input);
      sinon.assert.calledOnce(newUUIDStub);
    });

    it("should use provided id if present", async () => {
      const input = getValidInput({ id: "existing-id" });
      await createStoreAssignment(input);
      sinon.assert.notCalled(newUUIDStub);
      sinon.assert.calledWith(
        StoreAssignmentStub.create,
        sinon.match({ id: "existing-id" }),
      );
    });

    it("should not throw if requiredFields is satisfied", async () => {
      const input = getValidInput();
      await createStoreAssignment(input);
    });

    it("should not overwrite id if already present", async () => {
      const input = getValidInput({ id: "custom-id" });
      await createStoreAssignment(input);
      sinon.assert.notCalled(newUUIDStub);
      sinon.assert.calledWith(
        StoreAssignmentStub.create,
        sinon.match({ id: "custom-id" }),
      );
    });

    it("should throw BadRequestError if required field is missing", async () => {
      const input = getValidInput();
      delete input["userId"];
      try {
        await createStoreAssignment(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include('Field "userId" is required');
      }
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer with storeAssignment data", async () => {
      const input = getValidInput();
      await createStoreAssignment(input);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });

    it("should throw HttpServerError if ElasticIndexer.indexData fails", async () => {
      ElasticIndexerStub().indexData.rejects(new Error("Elastic error"));
      const input = getValidInput();

      try {
        await createStoreAssignment(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenCreatingStoreAssignment",
        );
        expect(err.details.message).to.equal("Elastic error");
      }
    });
  });
});
