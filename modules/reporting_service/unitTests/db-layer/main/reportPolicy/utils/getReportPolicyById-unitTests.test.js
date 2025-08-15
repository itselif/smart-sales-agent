const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getReportPolicyById module", () => {
  let sandbox;
  let getReportPolicyById;
  let ReportPolicyStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test ReportPolicy" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ReportPolicyStub = {
      findOne: sandbox.stub().resolves({
        getData: () => fakeData,
      }),
      findAll: sandbox
        .stub()
        .resolves([
          { getData: () => ({ id: "1", name: "Item 1" }) },
          { getData: () => ({ id: "2", name: "Item 2" }) },
        ]),
    };

    getReportPolicyById = proxyquire(
      "../../../../../src/db-layer/main/ReportPolicy/utils/getReportPolicyById",
      {
        models: { ReportPolicy: ReportPolicyStub },
        common: {
          HttpServerError: class HttpServerError extends Error {
            constructor(msg, details) {
              super(msg);
              this.name = "HttpServerError";
              this.details = details;
            }
          },
        },
        sequelize: { Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getReportPolicyById", () => {
    it("should return getData() for single ID", async () => {
      const result = await getReportPolicyById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(ReportPolicyStub.findOne);
      sinon.assert.calledWith(
        ReportPolicyStub.findOne,
        sinon.match.has("where", sinon.match.has("id", fakeId)),
      );
    });

    it("should return mapped getData() results for array of IDs", async () => {
      const result = await getReportPolicyById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(ReportPolicyStub.findAll);
      sinon.assert.calledWithMatch(ReportPolicyStub.findAll, {
        where: { id: { [Op.in]: ["1", "2"] } },
      });
    });

    it("should return null if record not found (single ID)", async () => {
      ReportPolicyStub.findOne.resolves(null);
      const result = await getReportPolicyById(fakeId);
      expect(result).to.be.null;
    });

    it("should return null if empty array returned from findAll", async () => {
      ReportPolicyStub.findAll.resolves([]);
      const result = await getReportPolicyById(["a", "b"]);
      expect(result).to.deep.equal([]);
    });

    it("should wrap unexpected errors with HttpServerError (single ID)", async () => {
      ReportPolicyStub.findOne.rejects(new Error("DB failure"));
      try {
        await getReportPolicyById("test");
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingReportPolicyById",
        );
        expect(err.details.message).to.equal("DB failure");
      }
    });

    it("should wrap unexpected errors with HttpServerError (array of IDs)", async () => {
      ReportPolicyStub.findAll.rejects(new Error("array failure"));
      try {
        await getReportPolicyById(["fail"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingReportPolicyById",
        );
        expect(err.details.message).to.equal("array failure");
      }
    });

    it("should return undefined if getData() returns undefined", async () => {
      ReportPolicyStub.findOne.resolves({ getData: () => undefined });
      const result = await getReportPolicyById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should return array of undefineds if getData() returns undefined per item", async () => {
      ReportPolicyStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getReportPolicyById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });
  });
});
