const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { NotAuthorizedError } = require("common");

describe("salesai-session", () => {
  beforeEach(() => {
    InstanceSession = proxyquire("../../src/project-session/salesai-session", {
      common: {
        hexaLogger: { log: sinon.stub() },
      },
      "../../src/project-session/hexa-auth": class {
        getBearerToken = sinon.stub();
        getCookieToken = sinon.stub();
      },
    });

    instance = new InstanceSession();
    instance.session = {}; // default dummy session
  });

  it("should read tenantId from query and resolve via codename", async () => {
    const req = { query: { _storeId: "idQ" }, headers: {} };

    sinon.stub(instance, "getStoreIdByCodename").resolves("resolved-idQ");

    await instance.readTenantIdFromRequest(req);
    expect(instance._storeId).to.equal("resolved-idQ");
  });

  it("should read tenantId from headers and resolve via codename", async () => {
    const req = { query: {}, headers: { "": "idH" } };

    sinon.stub(instance, "getStoreIdByCodename").resolves("resolved-idH");

    await instance.readTenantIdFromRequest(req);
    expect(instance._storeId).to.equal("resolved-idH");
  });

  it("should fallback to rootClientId if no tenantId given", async () => {
    const req = { query: {}, headers: {} };

    await instance.readTenantIdFromRequest(req);
    expect(instance._storeId).to.equal("d26f6763-ee90-4f97-bd8a-c69fabdb4780");
  });

  it("should fallback to rootClientId if codename not resolved", async () => {
    const req = { query: { _storeId: "invalidCodename" }, headers: {} };

    sinon.stub(instance, "getStoreIdByCodename").resolves(null);

    await instance.readTenantIdFromRequest(req);
    expect(instance._storeId).to.equal("d26f6763-ee90-4f97-bd8a-c69fabdb4780");
  });

  it("should accept valid UUID storeId as-is", async () => {
    const uuid = "e1a46c11-76de-4c1b-bf8d-8d5ed820aa0c";
    const req = { query: { _storeId: uuid }, headers: {} };

    await instance.readTenantIdFromRequest(req);
    expect(instance._storeId).to.equal(uuid);
  });
});
