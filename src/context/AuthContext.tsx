import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadStoredToken } from "../services/api";
import * as authService from "../services/authService";

type UserRole = "ROLE_GERENTE" | "ROLE_FUNCIONARIO";

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  role: UserRole | null;
  nomeUsuario: string | null;
  login: (
    cpf: string,
    senha: string,
  ) => Promise<{ role: UserRole; nomeUsuario: string }>;
  logout: () => Promise<void>;
  setRole: (role: UserRole | null) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const [nomeUsuario, setNomeUsuario] = useState<string | null>(null);

  useEffect(() => {
    async function bootstrap() {
      const token = await loadStoredToken();
      const storedRole = await AsyncStorage.getItem("userRole");
      const storedNome = await AsyncStorage.getItem("userName");
      setIsAuthenticated(!!token);
      if (storedRole) {
        setRole(storedRole as UserRole);
      }
      if (storedNome) {
        setNomeUsuario(storedNome);
      }
      setLoading(false);
    }

    bootstrap();
  }, []);

  async function handleLogin(cpf: string, senha: string) {
    const data = await authService.login({ cpf, senha });
    await authService.persistLogin(data.token, data.role, data.nomeUsuario);
    setIsAuthenticated(true);
    setRole(data.role);
    setNomeUsuario(data.nomeUsuario);
    return { role: data.role, nomeUsuario: data.nomeUsuario };
  }

  async function handleLogout() {
    try {
      await authService.logout();
      await AsyncStorage.removeItem("userRole");
      await AsyncStorage.removeItem("userName");
    } catch (e) {
      console.warn("Erro ao remover role:", e);
    } finally {
      setIsAuthenticated(false);
      setRole(null);
      setNomeUsuario(null);
    }
  }

  const value = useMemo(
    () => ({
      isAuthenticated,
      loading,
      role,
      nomeUsuario,
      login: handleLogin,
      logout: handleLogout,
      setRole,
    }),
    [isAuthenticated, loading, role, nomeUsuario],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext deve ser usado dentro de AuthProvider");
  }

  return context;
}
