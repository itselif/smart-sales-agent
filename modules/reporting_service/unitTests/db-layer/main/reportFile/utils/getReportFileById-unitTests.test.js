const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getReportFileById module", () => {
  let sandbox;
  let getReportFileById;
  let ReportFileStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test ReportFile" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ReportFileStub = {
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

    getReportFileById = proxyquire(
      "../../../../../src/db-layer/main/ReportFile/utils/getReportFileById",
      {
        models: { ReportFile: ReportFileStub },
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

  describe("getReportFileById", () => {
    it("should return getData() for single ID", async () => {
      const result = await getReportFileById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(ReportFileStub.findOne);
      sinon.assert.calledWith(
        ReportFileStub.findOne,
        sinon.match.has("where", sinon.match.has("id", fakeId)),
      );
    });

    it("should return mapped getData() results for array of IDs", async () => {
      const result = await getReportFileById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(ReportFileStub.findAll);
      sinon.assert.calledWithMatch(ReportFileStub.findAll, {
        where: { id: { [Op.in]: ["1", "2"] } },
      });
    });

    it("should return null if record not found (single ID)", async () => {
      ReportFileStub.findOne.resolves(null);
      const result = await getReportFileById(fakeId);
      expect(result).to.be.null;
    });

    it("should return null if empty array returned from findAll", async () => {
      ReportFileStub.findAll.resolves([]);
      const result = await getReportFileById(["a", "b"]);
      expect(result).to.deep.equal([]);
    });

    it("should wrap unexpected errors with HttpServerError (single ID)", async () => {
      ReportFileStub.findOne.rejects(new Error("DB failure"));
      try {
        await getReportFileById("test");
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingReportFileById",
        );
        expect(err.details.message).to.equal("DB failure");
      }
    });

    it("should wrap unexpected errors with HttpServerError (array of IDs)", async () => {
      ReportFileStub.findAll.rejects(new Error("array failure"));
      try {
        await getReportFileById(["fail"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingReportFileById",
        );
        expect(err.details.message).to.equal("array failure");
      }
    });

    it("should return undefined if getData() returns undefined", async () => {
      ReportFileStub.findOne.resolves({ getData: () => undefined });
      const result = await getReportFileById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should return array of undefineds if getData() returns undefined per item", async () => {
      ReportFileStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getReportFileById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });
  });
});
