import { createAuthClient } from "better-auth/react";
import { API_BASE_URL, apiFetch, type DataEnvelope } from "@/lib/api/client";
import type { Role, SessionUser } from "@/lib/types";

export const authClient = createAuthClient({
  baseURL: `${API_BASE_URL}/api/auth`,
  fetchOptions: {
    credentials: "include",
  },
});

interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
  phone?: string | null;
}

export function mapAuthUser(user: AuthUser): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: (user.role === "admin" ? "admin" : "customer") as Role,
    phone: user.phone ?? undefined,
  };
}

export async function fetchSessionUser(): Promise<SessionUser | null> {
  const { data } = await authClient.getSession();
  if (!data?.user) return null;
  return mapAuthUser(data.user as AuthUser);
}

function authErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

export async function signInWithEmail(email: string, password: string) {
  const result = await authClient.signIn.email({ email, password });
  if (result.error) {
    throw new Error(authErrorMessage(result.error, "Email atau password salah."));
  }
  return fetchSessionUser();
}

export async function signUpWithEmail(input: {
  name: string;
  email: string;
  password: string;
}) {
  const result = await authClient.signUp.email(input);
  if (result.error) {
    throw new Error(
      authErrorMessage(result.error, "Pendaftaran gagal. Coba lagi."),
    );
  }
  return result.data;
}

export async function signOutCurrentUser() {
  await authClient.signOut();
}

export async function requestPasswordReset(email: string) {
  const result = await authClient.requestPasswordReset({
    email,
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (result.error) {
    throw new Error(
      authErrorMessage(result.error, "Gagal mengirim tautan reset password."),
    );
  }
}

export async function resetPasswordWithToken(token: string, password: string) {
  const result = await authClient.resetPassword({
    token,
    newPassword: password,
  });
  if (result.error) {
    throw new Error(
      authErrorMessage(result.error, "Token reset tidak valid atau kedaluwarsa."),
    );
  }
}

export async function verifyEmailWithToken(token: string) {
  const result = await authClient.verifyEmail({ query: { token } });
  if (result.error) {
    throw new Error(
      authErrorMessage(result.error, "Tautan verifikasi tidak valid."),
    );
  }
}

export async function resendVerificationEmail(email: string) {
  const result = await authClient.sendVerificationEmail({
    email,
    callbackURL: "/login",
  });
  if (result.error) {
    throw new Error(
      authErrorMessage(result.error, "Gagal mengirim ulang email verifikasi."),
    );
  }
}

export async function updateMyProfile(input: {
  name?: string;
  phone?: string;
}) {
  const response = await apiFetch<DataEnvelope<AuthUser>>("/api/me", {
    method: "PATCH",
    body: JSON.stringify({
      name: input.name,
      ...(input.phone ? { phone: input.phone } : {}),
    }),
  });
  return mapAuthUser(response.data);
}
