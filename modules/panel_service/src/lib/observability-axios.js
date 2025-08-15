import axios from "axios";

import { CONFIG } from "src/global-config";

const observabilityAxiosInstance = axios.create({
  baseURL: CONFIG.observabilityServiceUrl,
});

observabilityAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) =>
    Promise.reject(
      (error.response && error.response.data) || "Something went wrong!",
    ),
);

export default observabilityAxiosInstance;

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await observabilityAxiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error("Failed to fetch:", error);
    throw error;
  }
};

export const observabilityEndpoints = {
  auditLog: {
    getAuditLog: "/auditlogs/:auditLogId",
    createAuditLog: "/auditlogs",
    updateAuditLog: "/auditlogs/:auditLogId",
    deleteAuditLog: "/auditlogs/:auditLogId",
    listAuditLogs: "/auditlogs",
  },

  metricDatapoint: {
    getMetricDatapoint: "/metricdatapoints/:metricDatapointId",
    createMetricDatapoint: "/metricdatapoints",
    updateMetricDatapoint: "/metricdatapoints/:metricDatapointId",
    deleteMetricDatapoint: "/metricdatapoints/:metricDatapointId",
    listMetricDatapoints: "/metricdatapoints",
  },

  anomalyEvent: {
    getAnomalyEvent: "/anomalyevents/:anomalyEventId",
    createAnomalyEvent: "/anomalyevents",
    updateAnomalyEvent: "/anomalyevents/:anomalyEventId",
    deleteAnomalyEvent: "/anomalyevents/:anomalyEventId",
    listAnomalyEvents: "/anomalyevents",
  },
};
