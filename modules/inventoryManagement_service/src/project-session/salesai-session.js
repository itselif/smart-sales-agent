const { NotAuthenticatedError, ForbiddenError } = require("common");
const { hexaLogger } = require("common");
const HexaAuth = require("./hexa-auth");

const { getRedisData, redisClient } = require("common");

class SalesaiSession extends HexaAuth {
  constructor() {
    super();
    this.ROLES = {};

    this.isMultiTenant = true;
    this.tenantIdName = "storeId";
    this.tenantName = "store";

    this.projectName = "salesai";
    this.projectCodename = "salesai1";
    this.isJWT = true;
    this.isJWTAuthRSA = true;
    this.isRemoteAuth = false;
    this.useRemoteSession = false;
  }

  async getTenantIdByCodename(codename) {
    const cachedTenantId = await getRedisData(`tenant:${codename}`);
    if (cachedTenantId) {
      return cachedTenantId;
    }

    const tenantId = await this.getStoreIdByCodename(codename);
    if (tenantId) {
      // cache the tenantId for 60 days
      redisClient.set(`tenant:${codename}`, tenantId, "EX", 3600 * 24 * 60);
      return tenantId;
    }
  }

  async getStoreIdByCodename(codename) {
    const elasticIndexer = new ElasticIndexer("store");
    const store = elasticIndexer.getOne({
      bool: {
        must: [{ term: { codename: codename } }, { term: { isActive: true } }],
      },
    });
    if (!store) {
      return null;
    }

    return store.id;
  }
}

module.exports = SalesaiSession;
