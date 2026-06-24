import { useCallback, useEffect, useState } from "react";
import { fetchMe, getToken, login as apiLogin, logout as apiLogout } from "../services/api.js";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function bootstrap() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const me = await fetchMe();
        if (active) setUser(me);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }
    bootstrap();

    const handleUnauthorized = () => setUser(null);
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      active = false;
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  const login = useCallback(async (username, password) => {
    const loggedIn = await apiLogin(username, password);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
  }, []);

  return { user, loading, login, logout };
}
