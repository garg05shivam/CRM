import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import { loginApi } from "../api/auth";
import type {
  AuthenticatedUser,
} from "../types/auth";

interface AuthContextValue {
  user: AuthenticatedUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({
  children,
}: AuthProviderProps) => {
  const [user, setUser] =
    useState<AuthenticatedUser | null>(() => {
      const storedUser =
        localStorage.getItem("user");

      return storedUser
        ? JSON.parse(storedUser)
        : null;
    });

  const [accessToken, setAccessToken] =
    useState<string | null>(() =>
      localStorage.getItem(
        "accessToken",
      ),
    );

  const login = async (
    email: string,
    password: string,
  ) => {
    const response = await loginApi({
      email,
      password,
    });

    const {
      user: authenticatedUser,
      accessToken: token,
    } = response.data;

    localStorage.setItem(
      "accessToken",
      token,
    );

    localStorage.setItem(
      "user",
      JSON.stringify(authenticatedUser),
    );

    setAccessToken(token);
    setUser(authenticatedUser);
  };

  const logout = () => {
    localStorage.removeItem(
      "accessToken",
    );

    localStorage.removeItem("user");

    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated:
          Boolean(accessToken && user),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
};