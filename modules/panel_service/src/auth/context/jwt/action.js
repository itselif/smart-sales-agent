import authAxios, { authEndpoints } from "src/lib/auth-axios";

import { setSession } from "./utils";

export const signInWithPassword = async ({ username, password }) => {
  try {
    const params = { username, password };

    const res = await authAxios.post(authEndpoints.login, params);

    const { accessToken } = res.data;

    if (!accessToken) {
      throw new Error("Access token not found in response");
    }

    await setSession(accessToken);
  } catch (error) {
    console.error("Error during sign in:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await authAxios.post(authEndpoints.logout);

    await setSession(null);
  } catch (error) {
    console.error("Error during sign out:", error);
    throw error;
  }
};
