/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { api, setAuthToken } from "../api";

type User = { username: string; role: "admin"|"provider"|"staff"|"client"; ref_dni?: string; };
type AuthState = { user: User | null; token: string | null; loading: boolean; };

type Ctx = AuthState & {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<Ctx>({
  user: null, token: null, loading: true,
  login: async () => {}, logout: () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, token: null, loading: true });

  // Lee token de localStorage y valida con /auth/me
  useEffect(() => {
    let cancelled = false;
    const t = localStorage.getItem("token");
    if (!t) { setState({ user: null, token: null, loading: false }); return; }
    setState(s => ({ ...s, token: t }));
    setAuthToken(t);
    api.get("/auth/me").then(r => {
      if (cancelled) return;
      setState({ user: r.data.user, token: t, loading: false });
    }).catch(() => {
      if (cancelled) return;
      localStorage.removeItem("token");
      setAuthToken(null);
      setState({ user: null, token: null, loading: false });
    });

    return () => { cancelled = true; };
  }, []);

  async function login(username: string, password: string) {
    const { data } = await api.post("/auth/login", { username, password });
    const token = data.token as string;
    localStorage.setItem("token", token);
    setAuthToken(token);
    setState({ user: data.user, token, loading: false });
  }

  function logout() {
    localStorage.removeItem("token");
    setAuthToken(null);
    setState({ user: null, token: null, loading: false });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
