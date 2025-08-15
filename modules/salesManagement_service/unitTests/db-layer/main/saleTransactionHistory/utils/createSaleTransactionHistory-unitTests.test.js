const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("createSaleTransactionHistory module", () => {
  let sandbox;
  let createSaleTransactionHistory;
  let SaleTransactionHistoryStub, ElasticIndexerStub, newUUIDStub;

  const fakeId = "uuid-123";
  const baseValidInput = {
    transactionId: "transactionId_val",
    changeType: "changeType_val",
    changedByUserId: "changedByUserId_val",
    changeTimestamp: "changeTimestamp_val",
    previousData: "previousData_val",
    storeId: "storeId_val",
  };
  const mockCreatedSaleTransactionHistory = {
    getData: () => ({ id: fakeId, ...baseValidInput }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    SaleTransactionHistoryStub = {
      create: sandbox.stub().resolves(mockCreatedSaleTransactionHistory),
    };

    ElasticIndexerStub = sandbox.stub().returns({
      indexData: sandbox.stub().resolves(),
    });

    newUUIDStub = sandbox.stub().returns(fakeId);

    createSaleTransactionHistory = proxyquire(
      "../../../../../src/db-layer/main/SaleTransactionHistory/utils/createSaleTransactionHistory",
      {
        models: { SaleTransactionHistory: SaleTransactionHistoryStub },
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

  describe("createSaleTransactionHistory", () => {
    it("should create SaleTransactionHistory and index to elastic if valid data", async () => {
      const input = getValidInput();
      const result = await createSaleTransactionHistory(input);

      expect(result).to.deep.equal({ id: fakeId, ...baseValidInput });
      sinon.assert.calledOnce(SaleTransactionHistoryStub.create);
      sinon.assert.calledOnce(ElasticIndexerStub);
    });

    it("should throw HttpServerError if SaleTransactionHistory.create fails", async () => {
      SaleTransactionHistoryStub.create.rejects(new Error("DB error"));
      const input = getValidInput();

      try {
        await createSaleTransactionHistory(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenCreatingSaleTransactionHistory",
        );
        expect(err.details.message).to.equal("DB error");
      }
    });
  });

  describe("validateData", () => {
    it("should generate new UUID if id is not provided", async () => {
      const input = getValidInput();
      delete input.id;
      await createSaleTransactionHistory(input);
      sinon.assert.calledOnce(newUUIDStub);
    });

    it("should use provided id if present", async () => {
      const input = getValidInput({ id: "existing-id" });
      await createSaleTransactionHistory(input);
      sinon.assert.notCalled(newUUIDStub);
      sinon.assert.calledWith(
        SaleTransactionHistoryStub.create,
        sinon.match({ id: "existing-id" }),
      );
    });

    it("should not throw if requiredFields is satisfied", async () => {
      const input = getValidInput();
      await createSaleTransactionHistory(input);
    });

    it("should not overwrite id if already present", async () => {
      const input = getValidInput({ id: "custom-id" });
      await createSaleTransactionHistory(input);
      sinon.assert.notCalled(newUUIDStub);
      sinon.assert.calledWith(
        SaleTransactionHistoryStub.create,
        sinon.match({ id: "custom-id" }),
      );
    });

    it("should throw BadRequestError if required field is missing", async () => {
      const input = getValidInput();
      delete input["transactionId"];
      try {
        await createSaleTransactionHistory(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include(
          'Field "transactionId" is required',
        );
      }
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer with saleTransactionHistory data", async () => {
      const input = getValidInput();
      await createSaleTransactionHistory(input);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });

    it("should throw HttpServerError if ElasticIndexer.indexData fails", async () => {
      ElasticIndexerStub().indexData.rejects(new Error("Elastic error"));
      const input = getValidInput();

      try {
        await createSaleTransactionHistory(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenCreatingSaleTransactionHistory",
        );
        expect(err.details.message).to.equal("Elastic error");
      }
    });
  });
});
