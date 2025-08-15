const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("createSaleTransaction module", () => {
  let sandbox;
  let createSaleTransaction;
  let SaleTransactionStub, ElasticIndexerStub, newUUIDStub;

  const fakeId = "uuid-123";
  const baseValidInput = {
    sellerId: "sellerId_val",
    amount: "amount_val",
    currency: "currency_val",
    transactionDate: "transactionDate_val",
    status: "status_val",
    storeId: "storeId_val",
  };
  const mockCreatedSaleTransaction = {
    getData: () => ({ id: fakeId, ...baseValidInput }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    SaleTransactionStub = {
      create: sandbox.stub().resolves(mockCreatedSaleTransaction),
    };

    ElasticIndexerStub = sandbox.stub().returns({
      indexData: sandbox.stub().resolves(),
    });

    newUUIDStub = sandbox.stub().returns(fakeId);

    createSaleTransaction = proxyquire(
      "../../../../../src/db-layer/main/SaleTransaction/utils/createSaleTransaction",
      {
        models: { SaleTransaction: SaleTransactionStub },
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

  describe("createSaleTransaction", () => {
    it("should create SaleTransaction and index to elastic if valid data", async () => {
      const input = getValidInput();
      const result = await createSaleTransaction(input);

      expect(result).to.deep.equal({ id: fakeId, ...baseValidInput });
      sinon.assert.calledOnce(SaleTransactionStub.create);
      sinon.assert.calledOnce(ElasticIndexerStub);
    });

    it("should throw HttpServerError if SaleTransaction.create fails", async () => {
      SaleTransactionStub.create.rejects(new Error("DB error"));
      const input = getValidInput();

      try {
        await createSaleTransaction(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenCreatingSaleTransaction",
        );
        expect(err.details.message).to.equal("DB error");
      }
    });
  });

  describe("validateData", () => {
    it("should generate new UUID if id is not provided", async () => {
      const input = getValidInput();
      delete input.id;
      await createSaleTransaction(input);
      sinon.assert.calledOnce(newUUIDStub);
    });

    it("should use provided id if present", async () => {
      const input = getValidInput({ id: "existing-id" });
      await createSaleTransaction(input);
      sinon.assert.notCalled(newUUIDStub);
      sinon.assert.calledWith(
        SaleTransactionStub.create,
        sinon.match({ id: "existing-id" }),
      );
    });

    it("should not throw if requiredFields is satisfied", async () => {
      const input = getValidInput();
      await createSaleTransaction(input);
    });

    it("should not overwrite id if already present", async () => {
      const input = getValidInput({ id: "custom-id" });
      await createSaleTransaction(input);
      sinon.assert.notCalled(newUUIDStub);
      sinon.assert.calledWith(
        SaleTransactionStub.create,
        sinon.match({ id: "custom-id" }),
      );
    });

    it("should throw BadRequestError if required field is missing", async () => {
      const input = getValidInput();
      delete input["sellerId"];
      try {
        await createSaleTransaction(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include('Field "sellerId" is required');
      }
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer with saleTransaction data", async () => {
      const input = getValidInput();
      await createSaleTransaction(input);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });

    it("should throw HttpServerError if ElasticIndexer.indexData fails", async () => {
      ElasticIndexerStub().indexData.rejects(new Error("Elastic error"));
      const input = getValidInput();

      try {
        await createSaleTransaction(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenCreatingSaleTransaction",
        );
        expect(err.details.message).to.equal("Elastic error");
      }
    });
  });
});
