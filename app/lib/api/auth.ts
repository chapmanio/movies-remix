import { apiFetch, apiRaw } from '../api';

// Types
type UnauthenticatedUser = {
  auth: false;
};

type AuthenticatedUser = {
  auth: true;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export type AuthUser = UnauthenticatedUser | AuthenticatedUser;

export type RegisterParams = {
  name: string;
  email: string;
  password: string;
};

export type SignInParams = {
  email: string;
  password: string;
};

export type UpdateParams = {
  name: string;
  email: string;
  password: string;
};

// Handlers
export const authUser = async (headers?: HeadersInit) => {
  return apiFetch<AuthUser>(`/auth`, { headers });
};

export const registerUser = async ({ name, email, password }: RegisterParams) => {
  return apiRaw(`/auth/register`, {
    method: 'POST',
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });
};

export const updateUser = async (
  { name, email, password }: UpdateParams,
  headers?: HeadersInit
) => {
  return apiRaw(`/auth/account/${email}`, {
    method: 'POST',
    body: JSON.stringify({
      name,
      email,
      password,
    }),
    headers,
  });
};

export const deleteUser = async (email: string, headers?: HeadersInit) => {
  return await apiRaw(`/auth/delete/${email}`, { method: 'POST', headers });
};

export const signIn = async ({ email, password }: SignInParams) => {
  return apiRaw(`/auth/sign-in`, {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  });
};

export const signOut = async () => {
  return apiRaw(`/auth/sign-out`, { method: 'POST' });
};
