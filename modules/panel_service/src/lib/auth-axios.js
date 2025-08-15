import axios from "axios";

import { CONFIG } from "src/global-config";

const authAxiosInstance = axios.create({ baseURL: CONFIG.authServiceUrl });

authAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) =>
    Promise.reject(
      (error.response && error.response.data) || "Something went wrong!",
    ),
);

export default authAxiosInstance;

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await authAxiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error("Failed to fetch:", error);
    throw error;
  }
};

export const authEndpoints = {
  login: "/login",
  me: "/users/:userId",
  logout: "/logout",

  user: {
    createUser: "/users",
    updateUser: "/users/:userId",
    deleteUser: "/users/:userId",
    updateUserRole: "/userrole/:userId",
    updatePassword: "/password/:userId",
    registerTenantUser: "/registertenantuser",
    registerStoreOwner: "/registerstoreowner",
    getUser: "/users/:userId",
    listUsers: "/users",
  },

  userGroup: {
    createGroup: "/group",
    updateGroup: "/group/:userGroupId",
    getGroup: "/group/:userGroupId",
    listGroups: "/groups",
  },

  userGroupMember: {
    createGroupMember: "/groupmember",
    deleteGroupMember: "/groupmember/:userGroupMemberId",
    getGroupMember: "/groupmember/:userGroupMemberId",
    listGroupMembers: "/groupmembers",
  },

  store: {
    createStore: "/stores",
    getStore: "/stores/:storeId",
    getStoreByCodename: "/storebycodename/:codename",
    listRegisteredStores: "/registeredstores",
  },
};
