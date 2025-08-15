import authAxios from "src/lib/auth-axios";
import reportingAxios from "src/lib/reporting-axios";
import observabilityAxios from "src/lib/observability-axios";
import platformAdminAxios from "src/lib/platformAdmin-axios";
import salesManagementAxios from "src/lib/salesManagement-axios";
import storeManagementAxios from "src/lib/storeManagement-axios";
import inventoryManagementAxios from "src/lib/inventoryManagement-axios";

import { JWT_STORAGE_KEY } from "./constant";

export function jwtDecode(token) {
  try {
    if (!token) return null;

    const parts = token.split(".");
    if (parts.length < 2) {
      throw new Error("Invalid token!");
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(base64));

    return decoded;
  } catch (error) {
    console.error("Error decoding token:", error);
    throw error;
  }
}

export function isValidToken(accessToken) {
  if (!accessToken) {
    return false;
  }

  try {
    return jwtDecode(accessToken);
  } catch (error) {
    console.error("Error during token validation:", error);
    return false;
  }
}

export async function setSession(accessToken) {
  try {
    if (accessToken) {
      sessionStorage.setItem(JWT_STORAGE_KEY, accessToken);

      salesManagementAxios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      inventoryManagementAxios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      storeManagementAxios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      reportingAxios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      observabilityAxios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      platformAdminAxios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      authAxios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      const decodedToken = jwtDecode(accessToken);

      if (!decodedToken) {
        throw new Error("Invalid access token!");
      }
      return decodedToken;
    } else {
      sessionStorage.removeItem(JWT_STORAGE_KEY);

      delete salesManagementAxios.defaults.headers.common.Authorization;

      delete inventoryManagementAxios.defaults.headers.common.Authorization;

      delete storeManagementAxios.defaults.headers.common.Authorization;

      delete reportingAxios.defaults.headers.common.Authorization;

      delete observabilityAxios.defaults.headers.common.Authorization;

      delete platformAdminAxios.defaults.headers.common.Authorization;

      delete authAxios.defaults.headers.common.Authorization;

      return null;
    }
  } catch (error) {
    console.error("Error during set session:", error);
    throw error;
  }
}
