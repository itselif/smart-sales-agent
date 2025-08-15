const { User } = require("models");
const { createHexCode } = require("common");
const { hexaLogger } = require("common");
const { hashCompare, hashString } = require("common");
const path = require("path");
const fs = require("fs");

const {
  HttpServerError,
  ForbiddenError,
  NotAuthenticatedError,
  ErrorCodes,
} = require("common");

const { getRedisData, setRedisData } = require("common");

const { Op } = require("sequelize");

const { UserGroup, UserGroupMember } = require("models");

const { getStoreById, getStoreByQuery } = require("dbLayer");

const { getUserByQuery, createUser, updateUserById } = require("dbLayer");

const SalesaiSession = require("./salesai-session");

class SalesaiLoginSession extends SalesaiSession {
  async #getGroupsOfUser(userId) {
    let groups = await this.#getGroupsOfUserFromSequelize(userId);

    const groupIdList = groups.map((group) => group.groupId);
    return groupIdList;
  }

  async #getGroupsFromSequelize() {
    const options = { where: { isActive: { [Op.eq]: true } } };

    const groups = await UserGroup.findAll(options);
    return groups.map((group) => group.getData());
  }

  async #getGroupsOfUserFromSequelize(userId) {
    const options = {
      where: {
        [Op.and]: [
          { isActive: { [Op.eq]: true } },
          { userId: { [Op.eq]: userId } },
        ],
      },
    };
    const groupsOfUser = await UserGroupMember.findAll(options);
    return groupsOfUser;
  }

  async #collectUserGroups(userId) {
    let groups = await this.#getGroupsFromSequelize();

    const groupsOfUser = await this.#getGroupsOfUser(userId);
    groups = groups.filter((group) => groupsOfUser.includes(group.id));
    return groups;
  }

  async #getUserFromDb(userField, userValue) {
    const where = {
      [Op.and]: [
        { [userField]: { [Op.eq]: userValue } },
        { storeId: { [Op.eq]: this._storeId } },
        { isActive: { [Op.eq]: true } },
      ],
    };
    console.log("where", where);
    const user = await getUserByQuery(where);

    //check if the user is a root user and owner of this tenant

    return user;
  }

  async #getUserWithUsernamePassword(email, password) {
    console.log("check user with email", email);
    const user = await this.#getUserFromDb("email", email);

    if (!user) {
      throw new NotAuthenticatedError(
        "errMsg_UserNotFound",
        ErrorCodes.UserNotFound,
      );
    }

    const userPassword = user.password;

    if (!(hashCompare(password, userPassword) == true)) {
      throw new ForbiddenError(
        "errMsg_PasswordDoesntMatch",
        ErrorCodes.WrongPassword,
      );
    }

    return user;
  }

  async #getUserWithSsoSubject(userField, ssoSubject) {
    const user = await this.#getUserFromDb(userField, ssoSubject);
    if (!user) {
      throw new NotAuthenticatedError(
        "errMsg_UserNotFound",
        ErrorCodes.UserNotFound,
      );
    }
    return user;
  }

  async #checkStoreInUserData(user) {
    if (!user.storeId) {
      throw new ForbiddenError(
        "errMsg_UserStoreNotDefined",
        ErrorCodes.UserTenantParameterMissing,
      );
    }

    if (!user.isAbsolute && user.storeId !== this._storeId) {
      throw new ForbiddenError(
        "errMsg_UserStoreDoesNotMatch",
        ErrorCodes.UserTenantMismatch,
      );
    }

    const loginStore = await getStoreById(this._storeId);

    if (!loginStore) {
      throw new ForbiddenError(
        "errMsg_LoginStoreNotFound",
        ErrorCodes.UserTenantNotFound,
      );
    }

    user.loginStore = loginStore;
    user.storeName = loginStore.name;
  }

  async getStoreIdByCodename(codename) {
    const whereClause = { codename: codename, isActive: true };
    const tenant = await getStoreByQuery(whereClause);
    return tenant ? tenant.id : null;
  }

  async loginUser(byPassword, bySubject) {
    const session = {};
    let user = null;
    if (byPassword) {
      user = await this.#getUserWithUsernamePassword(
        byPassword.username ?? byPassword.email,
        byPassword.password,
      );
    } else if (bySubject) {
      user = await this.#getUserWithSsoSubject(
        bySubject.userField,
        bySubject.subjectClaim,
      );
    }

    if (!user) return null;

    if (bySubject && bySubject.userField == "email") {
      // since email comes from social login, it can be considered as verified
      user.emailVerified = true;
    }

    if (user.emailVerified !== true) {
      throw new ForbiddenError(
        "errMsg_EmailNotVerified",
        ErrorCodes.EmailVerificationNeeded,
      );
    }

    if (user.id === this.superAdminId) user.isAbsolute = true;
    session.isAbsolute = user.isAbsolute;

    this.#checkStoreInUserData(user);
    session.tenantName = "store";
    session.tenantCodename = this.tenantCodename;

    session.id = byPassword
      ? createHexCode()
      : (bySubject?.sessionId ?? createHexCode());
    session.sessionId = session.id;
    session.hexaId = createHexCode();

    for (const key of Object.keys(user)) {
      if (key !== "id") session[key] = user[key];
    }

    session.userId = user.id;
    session._USERID = user.id;

    const userGroups = await this.#collectUserGroups(user.id);
    session.userGroupNames = userGroups.map((group) => group.groupName);
    session.userGroupIdList = userGroups.map((group) => group.id);

    return session;
  }

  async relogin(req) {
    console.log("salesai session found but a relogin is requested");
    try {
      const userField = "id";
      const subjectClaim = this.session.userId;
      await this.setLoginToRequest(req, null, { userField, subjectClaim });
      await this.setServiceSession(req);
      req.sessionToken = this.accessToken;
    } catch (err) {
      console.log(err);
      throw new HttpServerError(
        "errMsg_CantReLoginAfterUserAuthConfigUpdate",
        err,
      );
    }
  }

  async setLoginToRequest(req, byPassword, bySubject) {
    if (
      byPassword &&
      (!byPassword.password || (!byPassword.username && !byPassword.email))
    ) {
      throw new NotAuthenticatedError(
        "errMsg_UserCanNotLoginWithoutCredentials",
        ErrorCodes.UserLoginWithoutCredentials,
      );
    }
    const session = await this.loginUser(byPassword, bySubject);

    session._USERID = session.userId;

    session.checkTokenMark = "salesai1-inapp-token";
    session._USERID = session.userId;
    session.userBucketToken = await this.createBucketToken(session);
    await this.setSessionToEntityCache(session);

    req.session = session;
    const token = await this.createTokenFromSession(session, false);
    if (!token) {
      throw new HttpServerError("errMsg_LoginTokenCanNotBeCreated", {
        detail: "JWTLib couldnt create token",
      });
    }
    session.accessToken = token;
    this.session = req.session;
    this.sessionId = req.sessionId;
    req.auth = this;
    this.accessToken = token;
    this.tokenLocation = "cookie";
    req.sessionToken = this.accessToken;

    const cookieName = `salesai1-access-token-${this._storeId}`;

    this.tokenName = cookieName;
  }

  async loginBySocialAccount(accountInfo, req, res, next) {
    console.log("loginBySocialAccount", accountInfo);
    const userField = accountInfo.userField;
    const subjectClaim = accountInfo[userField];

    if (!userField || !subjectClaim) {
      return next(
        new NotAuthenticatedError(
          "errMsg_UserCanNotLoginWithoutCredentials",
          ErrorCodes.UserLoginWithoutCredentials,
        ),
      );
    }

    // check if user exists in db
    const user = await this.#getUserFromDb(userField, subjectClaim);

    if (!user && accountInfo.allowRegister) {
      await setRedisData(
        accountInfo.socialCode,
        JSON.stringify(accountInfo),
        60 * 3,
      ); // store for 3 minutes
      res.status(200).send({
        type: "RegisterNeededForSocialLogin",
        message: "User not found, but registration is allowed.",
        socialCode: accountInfo.socialCode,
        accountInfo: accountInfo,
      });
      return;
    }

    try {
      await this.readTenantIdFromRequest(req);
      await this.setLoginToRequest(req, null, { userField, subjectClaim });
      res.set(this.tokenName, this.accessToken);
      console.log("Session is created", this.session);
      res
        .cookie(this.tokenName, this.accessToken, {
          httpOnly: true,
          domain: process.env.COOKIE_URL,
        })
        .status(200)
        .send(this.session);
    } catch (err) {
      next(err);
    }
  }

  async init() {
    await this.initSuperAdmin();
    await this.initUserManager();
    await this.initAdminGroup();
    await this.initRootStore();
  }

  async initSuperAdmin() {
    try {
      const absUserData = {
        id: this.superAdminId,
        fullname: "Root User",
        email: "admin@aadmin.com",
        emailVerified: true,

        password: hashString("superadmin"),
        storeId: this.rootTenantId,
      };

      const { createUser, getUserById } = require("dbLayer");
      const absUser = await getUserById(absUserData.id);
      if (!absUser) {
        await createUser(absUserData);
      } else {
        delete absUserData.id;
        await updateUserById(this.superAdminId, absUserData);
      }
    } catch (err) {
      hexaLogger.error("Error while creating super admin user", err);
    }
  }

  async initUserManager() {
    try {
      const userManagerId = this.superAdminId.replaceAll("f", "b");
      const absUserData = {
        id: userManagerId,
        fullname: "User Manager",
        email: "user.manager@mindbrix.com",
        emailVerified: true,

        password: hashString("superadmin"),
        storeId: this.rootTenantId,
      };

      const { createUser, getUserById } = require("dbLayer");
      const absUser = await getUserById(absUserData.id);
      if (!absUser) {
        await createUser(absUserData);
      } else {
        delete absUserData.id;
        await updateUserById(userManagerId, absUserData);
      }
    } catch (err) {
      hexaLogger.error("Error while creating user manager user", err);
    }
  }

  async initAdminGroup() {
    const {
      createUserGroup,
      getUserGroupById,
      getUserGroupMemberById,
      createUserGroupMember,
    } = require("dbLayer");
    const adminGroupData = {
      id: this.adminGroupId,
      groupName: "Admins",
    };
    try {
      const adminGroup = await getUserGroupById(adminGroupData.id);
      if (!adminGroup) {
        await createUserGroup(adminGroupData);
      }

      const adminGroupMemberData = {
        id: this.adminGroupMemberId,
        userId: this.superAdminId,
        groupId: this.adminGroupId,
        ownerId: this.superAdminId,
      };
      const adminGroupMember = await getUserGroupMemberById(
        adminGroupMemberData.id,
      );
      if (!adminGroupMember) {
        await createUserGroupMember(adminGroupMemberData);
      }
    } catch (err) {
      hexaLogger.error("Error while creating admin group", err);
    }
  }

  async initRootStore() {
    const absStoreData = {
      id: this.rootTenantId,
      name: "$Root",
      fullname: "Root Store",
      codename: "root",
      ownerId: this.superAdminId,
    };
    const { createStore, getStoreById } = require("dbLayer");

    const absStore = await getStoreById(absStoreData.id);
    if (!absStore) {
      await createStore(absStoreData);
    }
  }

  async invalidateUserAuthInSession(userId) {
    const userKey = "hexasessionid:" + userId;
    const userAuthUpdateKey = "hexauserauthupdate:" + userId;
    const sessionId = await getRedisData(userKey);
    if (sessionId) {
      await setRedisData(userAuthUpdateKey, "true");
    }
  }
}

// Export the class
module.exports = SalesaiLoginSession;
