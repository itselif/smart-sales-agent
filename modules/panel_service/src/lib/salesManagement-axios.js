import axios from "axios";

import { CONFIG } from "src/global-config";

const salesManagementAxiosInstance = axios.create({
  baseURL: CONFIG.salesManagementServiceUrl,
});

salesManagementAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) =>
    Promise.reject(
      (error.response && error.response.data) || "Something went wrong!",
    ),
);

export default salesManagementAxiosInstance;

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await salesManagementAxiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error("Failed to fetch:", error);
    throw error;
  }
};

export const salesManagementEndpoints = {
  saleTransaction: {
    getSaleTransaction: "/saletransactions/:saleTransactionId",
    createSaleTransaction: "/saletransactions",
    updateSaleTransaction: "/saletransactions/:saleTransactionId",
    deleteSaleTransaction: "/saletransactions/:saleTransactionId",
    listSaleTransactions: "/saletransactions",
  },

  saleTransactionHistory: {
    getSaleTransactionHistory:
      "/saletransactionhistories/:saleTransactionHistoryId",
    createSaleTransactionHistory: "/saletransactionhistories",
    deleteSaleTransactionHistory:
      "/saletransactionhistories/:saleTransactionHistoryId",
    listSaleTransactionHistories: "/saletransactionhistories",
  },
};
