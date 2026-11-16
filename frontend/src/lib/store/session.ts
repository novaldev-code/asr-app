import { create } from "zustand";
import {
  fetchSessionUser,
  signInWithEmail,
  signOutCurrentUser,
  signUpWithEmail,
  updateMyProfile,
} from "@/lib/api/auth";
import type { SessionUser } from "@/lib/types";

type SessionStatus = "loading" | "authenticated" | "anonymous";

interface SessionState {
  user: SessionUser | null;
  status: SessionStatus;
  refresh: () => Promise<SessionUser | null>;
  login: (input: { email: string; password: string }) => Promise<SessionUser>;
  register: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (input: { name: string; phone?: string }) => Promise<void>;
}

export const useSessionStore = create<SessionState>()((set) => ({
  user: null,
  status: "loading",

  refresh: async () => {
    set({ status: "loading" });
    try {
      const user = await fetchSessionUser();
      set({ user, status: user ? "authenticated" : "anonymous" });
      return user;
    } catch {
      set({ user: null, status: "anonymous" });
      return null;
    }
  },

  login: async ({ email, password }) => {
    set({ status: "loading" });
    try {
      const user = await signInWithEmail(email, password);
      if (!user) {
        throw new Error("Sesi tidak dapat dibuat. Coba lagi.");
      }
      set({ user, status: "authenticated" });
      return user;
    } catch (error) {
      set((state) => ({
        user: state.user,
        status: state.user ? "authenticated" : "anonymous",
      }));
      throw error;
    }
  },

  register: async ({ name, email, password }) => {
    await signUpWithEmail({ name, email, password });
  },

  logout: async () => {
    try {
      await signOutCurrentUser();
    } finally {
      set({ user: null, status: "anonymous" });
    }
  },

  updateProfile: async (input) => {
    const user = await updateMyProfile(input);
    set({ user, status: "authenticated" });
  },
}));
