import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api } from "../services/apiClient";
import Router from 'next/router';
import { setCookie, parseCookies, destroyCookie } from 'nookies';

type SignInCredentials = {
  email: string;
  password: string;
}

type User = {
  email: string;
  permissions: string[];
  roles: string[];
}

type AuthProviderProps = {
  children: ReactNode;
}

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>;
  isAuthenticated: boolean;
  user: User;
};
export const AuthContext = createContext({} as AuthContextData);

export function signOut() {
  destroyCookie(undefined, 'NextAuth.token')
  destroyCookie(undefined, 'NextAuth.refreshToken')
  Router.push('/')
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>(null)
  const isAuthenticated = user ? true : false;

  useEffect(() => {
    const { 'NextAuth.token': token } = parseCookies();
    if (token) {
      api.get('/me')
        .then(response => {
          const { email, permissions, roles } = response.data;
          setUser({ email, permissions, roles })
        })
        .catch(() => {
          signOut();
        })
    }
  }, [])

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post('sessions', { email, password })

      const { token, refreshToken, permissions, roles } = response.data;

      setCookie(undefined, 'NextAuth.token', token, {
        maxAge: 60 * 60 * 24 * 30, //30days
        path: '/'
      })
      setCookie(undefined, 'NextAuth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, //30days
        path: '/'
      })

      setUser({
        email,
        permissions,
        roles,
      })

      api.defaults.headers['Authorization'] = `Bearer ${token}`;

      Router.push('/dashboard')
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider >
  );
}

export const useAuth = () => useContext(AuthContext);
