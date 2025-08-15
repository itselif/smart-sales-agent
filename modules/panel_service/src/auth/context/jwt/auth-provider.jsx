import { useSetState } from "minimal-shared/hooks";
import { useMemo, useEffect, useCallback } from "react";

import authAxios, { authEndpoints } from "src/lib/auth-axios";

import { JWT_STORAGE_KEY } from "./constant";
import { AuthContext } from "../auth-context";
import { setSession, isValidToken } from "./utils";

export function AuthProvider({ children }) {
  const { state, setState } = useSetState({ user: null, loading: true });

  const checkUserSession = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(JWT_STORAGE_KEY);

      if (accessToken && isValidToken(accessToken)) {
        const decodedToken = await setSession(accessToken);

        const res = await authAxios.get(
          `${authEndpoints.me.replace(":userId", decodedToken?.userId)}`,
        );

        const { user } = res.data;

        setState({ user: { ...user, accessToken }, loading: false });
      } else {
        setState({ user: null, loading: false });
      }
    } catch (error) {
      console.error(error);
      setState({ user: null, loading: false });
    }
  }, [setState]);

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthenticated = state.user ? "authenticated" : "unauthenticated";

  const status = state.loading ? "loading" : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user
        ? { ...state.user, role: state.user?.role ?? "admin" }
        : null,
      checkUserSession,
      loading: status === "loading",
      authenticated: status === "authenticated",
      unauthenticated: status === "unauthenticated",
    }),
    [checkUserSession, state.user, status],
  );

  return (
    <AuthContext.Provider value={memoizedValue}>
      {children}
    </AuthContext.Provider>
  );
}
