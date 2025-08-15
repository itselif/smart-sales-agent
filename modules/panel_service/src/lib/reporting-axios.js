import axios from "axios";

import { CONFIG } from "src/global-config";

const reportingAxiosInstance = axios.create({
  baseURL: CONFIG.reportingServiceUrl,
});

reportingAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) =>
    Promise.reject(
      (error.response && error.response.data) || "Something went wrong!",
    ),
);

export default reportingAxiosInstance;

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await reportingAxiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error("Failed to fetch:", error);
    throw error;
  }
};

export const reportingEndpoints = {
  reportRequest: {
    getReportRequest: "/reportrequests/:reportRequestId",
    createReportRequest: "/reportrequests",
    updateReportRequest: "/reportrequests/:reportRequestId",
    deleteReportRequest: "/reportrequests/:reportRequestId",
    listReportRequests: "/reportrequests",
  },

  reportFile: {
    getReportFile: "/reportfiles/:reportFileId",
    createReportFile: "/reportfiles",
    updateReportFile: "/reportfiles/:reportFileId",
    deleteReportFile: "/reportfiles/:reportFileId",
    listReportFiles: "/reportfiles",
  },

  reportPolicy: {
    getReportPolicy: "/reportpolicies/:reportPolicyId",
    createReportPolicy: "/reportpolicies",
    updateReportPolicy: "/reportpolicies/:reportPolicyId",
    deleteReportPolicy: "/reportpolicies/:reportPolicyId",
    listReportPolicies: "/reportpolicies",
  },
};
