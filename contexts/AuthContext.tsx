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
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
  user: User;
};
export const AuthContext = createContext({} as AuthContextData);

let authChannel: BroadcastChannel;

export function signOut() {
  destroyCookie(undefined, 'NextAuth.token');
  destroyCookie(undefined, 'NextAuth.refreshToken');

  authChannel.postMessage('signOut')
  Router.push('/')
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>(null)
  const isAuthenticated = user ? true : false;

  useEffect(() => {
    authChannel = new BroadcastChannel('auth')
    authChannel.onmessage = (message) => {
      switch (message.data) {
        case "signOut":
          signOut();
          authChannel.close();
          break;
        case "signIn": window.location.replace("http://localhost:3000/dashboard");
          break;
        default:
          break;

      }
    }
  }, [])

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
      authChannel.postMessage("signIn");
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user, signOut }}>
      {children}
    </AuthContext.Provider >
  );
}

export const useAuth = () => useContext(AuthContext);
