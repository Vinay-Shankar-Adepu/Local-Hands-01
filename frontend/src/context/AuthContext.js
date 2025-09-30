import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import API from "../services/api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);   // {id, name, email, role, verified}
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Restore session on mount
  useEffect(() => {
    const cachedToken = localStorage.getItem("lh_token");
    const cachedUser = localStorage.getItem("lh_user");

    if (cachedToken) {
      setToken(cachedToken);

      API.get("/auth/me", {
        headers: { Authorization: `Bearer ${cachedToken}` },
      })
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem("lh_user", JSON.stringify(res.data.user));
        })
        .catch((err) => {
          console.warn("Session validation failed:", err.message);
          // fallback: try cached user
          if (cachedUser) {
            try {
              setUser(JSON.parse(cachedUser));
            } catch (e) {
              console.error("Error parsing cached user:", e);
              clearSession();
            }
          } else {
            clearSession();
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // 🔹 Save session (token + user)
  const saveSession = (t, u) => {
    if (t) {
      setToken(t);
      localStorage.setItem("lh_token", t);
    }
    if (u) {
      setUser(u);
      localStorage.setItem("lh_user", JSON.stringify(u));
    }
  };

  // 🔹 Clear session completely
  const clearSession = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("lh_token");
    localStorage.removeItem("lh_user");
  };

  // 🔹 Auth methods
  const register = async (payload) => {
    const { data } = await API.post("/auth/register", payload);
    saveSession(data.token, data.user);
    return data.user;
  };

  const login = async (payload) => {
    const { data } = await API.post("/auth/login", payload);
    saveSession(data.token, data.user);
    return data.user;
  };

  const loginWithGoogleIdToken = async (idToken) => {
    const { data } = await API.post("/auth/google", { idToken });
    saveSession(data.token, data.user);
    return data.user;
  };

  const setRole = async (role) => {
    const { data } = await API.post(
      "/auth/set-role",
      { role },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    // some APIs return only updated user, others return token+user
    saveSession(data.token || token, data.user);
    return data.user;
  };

  const logout = () => clearSession();

  // 🔹 Centralized redirect helper
  const redirectAfterAuth = (u, nav) => {
    if (!u?.role) nav("/choose-role", { replace: true });
    else nav(`/${u.role}`, { replace: true });
  };

  // 🔹 Context value
  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      register,
      login,
      loginWithGoogleIdToken,
      setRole,
      logout,
      redirectAfterAuth,
      isAuthenticated: !!token,
      isAdmin: user?.role === "admin",
      saveSession // expose for profile refresh if needed later
    }),
    [user, token, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
