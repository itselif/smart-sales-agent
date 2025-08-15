import axios from "axios";

import { CONFIG } from "src/global-config";

const platformAdminAxiosInstance = axios.create({
  baseURL: CONFIG.platformAdminServiceUrl,
});

platformAdminAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) =>
    Promise.reject(
      (error.response && error.response.data) || "Something went wrong!",
    ),
);

export default platformAdminAxiosInstance;

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await platformAdminAxiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error("Failed to fetch:", error);
    throw error;
  }
};

export const platformAdminEndpoints = {
  openApiSchema: {
    getOpenApiSchema: "/openapischemas/:openApiSchemaId",
    createOpenApiSchema: "/openapischemas",
    updateOpenApiSchema: "/openapischemas/:openApiSchemaId",
    deleteOpenApiSchema: "/openapischemas/:openApiSchemaId",
    listOpenApiSchemas: "/openapischemas",
  },
};
