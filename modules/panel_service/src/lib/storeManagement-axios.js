import axios from "axios";

import { CONFIG } from "src/global-config";

const storeManagementAxiosInstance = axios.create({
  baseURL: CONFIG.storeManagementServiceUrl,
});

storeManagementAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) =>
    Promise.reject(
      (error.response && error.response.data) || "Something went wrong!",
    ),
);

export default storeManagementAxiosInstance;

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await storeManagementAxiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error("Failed to fetch:", error);
    throw error;
  }
};

export const storeManagementEndpoints = {
  store: {
    getStore: "/stores/:storeId",
    createStore: "/stores",
    updateStore: "/stores/:storeId",
    deleteStore: "/stores/:storeId",
    listStores: "/stores",
  },

  storeAssignment: {
    getStoreAssignment: "/storeassignments/:storeAssignmentId",
    createStoreAssignment: "/storeassignments",
    updateStoreAssignment: "/storeassignments/:storeAssignmentId",
    deleteStoreAssignment: "/storeassignments/:storeAssignmentId",
    listStoreAssignments: "/storeassignments",
  },
};
