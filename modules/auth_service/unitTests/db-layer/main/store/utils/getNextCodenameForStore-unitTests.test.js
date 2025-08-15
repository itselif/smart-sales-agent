const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getNextCodenameForStore module", () => {
  let sandbox;
  let getNextCodenameForStore;
  let StoreStub;

  const codenameRecords = (names) => names.map((codename) => ({ codename }));

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    StoreStub = {
      findAll: sandbox.stub(),
    };

    getNextCodenameForStore = proxyquire(
      "../../../../../src/db-layer/main/Store/utils/getNextCodenameForStore",
      {
        models: { Store: StoreStub },
        common: {
          HttpServerError: class HttpServerError extends Error {
            constructor(msg, details) {
              super(msg);
              this.name = "HttpServerError";
              this.details = details;
            }
          },
        },
        sequelize: {
          Op,
          fn: sinon.stub(),
          col: sinon.stub(),
          where: sinon.stub().returns("WHERE_CONDITION"),
          literal: sinon.stub(),
        },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getNextCodenameForStore", () => {
    it("should return base name if no matching records", async () => {
      StoreStub.findAll.resolves([]);
      const result = await getNextCodenameForStore("project");
      expect(result).to.equal("project");
    });

    it("should return base name if codename 'project' is free", async () => {
      StoreStub.findAll.resolves(codenameRecords(["project1", "project2"]));
      const result = await getNextCodenameForStore("project");
      expect(result).to.equal("project");
    });

    it("should return base name with next available suffix", async () => {
      StoreStub.findAll.resolves(
        codenameRecords(["project", "project1", "project2"]),
      );
      const result = await getNextCodenameForStore("project");
      expect(result).to.equal("project3");
    });

    it("should handle missing suffixes correctly and return smallest available number", async () => {
      StoreStub.findAll.resolves(
        codenameRecords(["project", "project2", "project3", "project5"]),
      );
      const result = await getNextCodenameForStore("project");
      expect(result).to.equal("project1");
    });

    it("should ignore invalid codename patterns", async () => {
      StoreStub.findAll.resolves(
        codenameRecords(["random", "projXYZ", "project-abc"]),
      );
      const result = await getNextCodenameForStore("project");
      expect(result).to.equal("project");
    });

    it("should escape special characters in base name", async () => {
      StoreStub.findAll.resolves(
        codenameRecords(["foo.bar", "foo.bar1", "foo.bar2"]),
      );
      const result = await getNextCodenameForStore("foo.bar");
      expect(result).to.equal("foo.bar3");
    });

    it("should throw HttpServerError if model query fails", async () => {
      StoreStub.findAll.rejects(new Error("DB crashed"));

      try {
        await getNextCodenameForStore("project");
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenGettingNextCodenameForStore",
        );
        expect(err.details.message).to.equal("DB crashed");
      }
    });
  });
});
