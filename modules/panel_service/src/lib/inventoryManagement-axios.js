import axios from "axios";

import { CONFIG } from "src/global-config";

const inventoryManagementAxiosInstance = axios.create({
  baseURL: CONFIG.inventoryManagementServiceUrl,
});

inventoryManagementAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) =>
    Promise.reject(
      (error.response && error.response.data) || "Something went wrong!",
    ),
);

export default inventoryManagementAxiosInstance;

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await inventoryManagementAxiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error("Failed to fetch:", error);
    throw error;
  }
};

export const inventoryManagementEndpoints = {
  inventoryItem: {
    getInventoryItem: "/inventoryitems/:inventoryItemId",
    createInventoryItem: "/inventoryitems",
    updateInventoryItem: "/inventoryitems/:inventoryItemId",
    deleteInventoryItem: "/inventoryitems/:inventoryItemId",
    listInventoryItems: "/inventoryitems",
  },

  inventoryMovement: {
    getInventoryMovement: "/inventorymovements/:inventoryMovementId",
    createInventoryMovement: "/inventorymovements",
    deleteInventoryMovement: "/inventorymovements/:inventoryMovementId",
    listInventoryMovements: "/inventorymovements",
  },

  lowStockAlert: {
    getLowStockAlert: "/lowstockalerts/:lowStockAlertId",
    createLowStockAlert: "/lowstockalerts",
    resolveLowStockAlert: "/resolvelowstockalert/:lowStockAlertId",
    deleteLowStockAlert: "/lowstockalerts/:lowStockAlertId",
    listLowStockAlerts: "/lowstockalerts",
  },
};
