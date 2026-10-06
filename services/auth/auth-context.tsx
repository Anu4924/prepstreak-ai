"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { AuthService, AuthSession, AuthUser, AuthResult } from "./auth-service";
import { ProfileService } from "@/services/profile/profile-service";
import { UserProfile, DbProfile } from "@/lib/types/user";

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;
  login: (
    email: string,
    pass: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string,
    targetExamId?: string
  ) => Promise<AuthResult>;
  initiateRegistration: (
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string,
    targetExamId?: string
  ) => Promise<AuthResult>;
  verifyRegistrationOtp: (email: string, otp: string) => Promise<AuthResult>;
  resendRegistrationOtp: (email: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  deleteAccount: (
    password: string
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
  resendConfirmationEmail: (
    email: string
  ) => Promise<{ success: boolean; message: string }>;
  refreshProfile: () => Promise<void>;
  updateProfile: (
    updates: Partial<DbProfile>
  ) => Promise<{ success: boolean; error?: string }>;
  updatePreferences: (prefs: {
    defaultExam?: string;
    dailyQuestionGoal?: number;
    preferredDifficulty?: "Easy" | "Medium" | "Hard" | "Adaptive";
  }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfileForUser = useCallback(
    async (
      userId: string,
      authUserEmail?: string,
      authUserName?: string,
      authExam?: string
    ) => {
      try {
        const p = await ProfileService.getProfile(userId);
        if (p) {
          setProfile(p);
        } else {
          setProfile({
            id: userId,
            name: authUserName || "Student",
            email: authUserEmail || "student@prepstreak.ai",
            currentExam: authExam || "None",
            examId: authExam || "",
            joinDate: "Recently",
            questionsSolved: 0,
            testsCompleted: 0,
            currentStreak: 0,
            longestStreak: 0,
            accuracy: 0,
            totalAttempted: 0,
            totalCorrect: 0,
            studyTimeMinutes: 0,
            onboardingCompleted: Boolean(authExam),
            preferences: {
              dailyQuestionGoal: 20,
              preferredDifficulty: "Adaptive",
              defaultExam: authExam || "",
              notificationsEnabled: true,
              darkMode: false,
            },
          });
        }
      } catch {
        setProfile({
          id: userId,
          name: authUserName || "Student",
          email: authUserEmail || "student@prepstreak.ai",
          currentExam: authExam || "None",
          examId: authExam || "",
          joinDate: "Recently",
          questionsSolved: 0,
          testsCompleted: 0,
          currentStreak: 0,
          longestStreak: 0,
          accuracy: 0,
          totalAttempted: 0,
          totalCorrect: 0,
          studyTimeMinutes: 0,
          onboardingCompleted: Boolean(authExam),
          preferences: {
            dailyQuestionGoal: 20,
            preferredDifficulty: "Adaptive",
            defaultExam: authExam || "",
            notificationsEnabled: true,
            darkMode: false,
          },
        });
      }
    },
    []
  );

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfileForUser(
        user.id,
        user.email,
        user.name,
        user.targetExamId
      );
    }
  }, [user, fetchProfileForUser]);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const currentSession = await AuthService.getCurrentSession();
        if (!isMounted) return;

        if (currentSession?.isAuthenticated && currentSession.user) {
          setUser(currentSession.user);
          setSession(currentSession);
          await fetchProfileForUser(
            currentSession.user.id,
            currentSession.user.email,
            currentSession.user.name,
            currentSession.user.targetExamId
          );
        } else {
          setUser(null);
          setSession(null);
          setProfile(null);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [fetchProfileForUser]);

  const login = async (email: string, pass: string) => {
    const res = await AuthService.loginWithEmail(email, pass);
    if (res.success && res.session?.user) {
      setUser(res.session.user);
      setSession(res.session);
      await fetchProfileForUser(
        res.session.user.id,
        res.session.user.email,
        res.session.user.name,
        res.session.user.targetExamId
      );
      return { success: true };
    }
    return {
      success: false,
      error: res.error || "Login failed. Please check your credentials.",
    };
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string,
    targetExamId: string = ""
  ) => {
    const res = await AuthService.register(
      fullName,
      email,
      password,
      confirmPassword,
      targetExamId
    );
    if (res.success && res.session?.user) {
      setUser(res.session.user);
      setSession(res.session);
      await fetchProfileForUser(
        res.session.user.id,
        res.session.user.email,
        res.session.user.name,
        res.session.user.targetExamId
      );
    }
    return res;
  };

  const initiateRegistration = async (
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string,
    targetExamId: string = ""
  ) => {
    return await register(
      fullName,
      email,
      password,
      confirmPassword,
      targetExamId
    );
  };

  const verifyRegistrationOtp = async (email: string, otp: string) => {
    const res = await AuthService.verifyRegistrationOtp(email, otp);
    if (res.success && res.session?.user) {
      setUser(res.session.user);
      setSession(res.session);
      await fetchProfileForUser(
        res.session.user.id,
        res.session.user.email,
        res.session.user.name,
        res.session.user.targetExamId
      );
    }
    return res;
  };

  const resendRegistrationOtp = async (email: string) => {
    return await AuthService.resendRegistrationOtp(email);
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
    }
  };

  const deleteAccount = async (password: string) => {
    const res = await AuthService.deleteAccount(password);
    if (res.success) {
      setUser(null);
      setSession(null);
      setProfile(null);
    }
    return res;
  };

  const resendConfirmationEmail = async (email: string) => {
    return {
      success: true,
      message: `Verification code dispatched to ${email}.`,
    };
  };

  const updateProfile = async (updates: Partial<DbProfile>) => {
    if (!user) return { success: false, error: "Not authenticated" };
    const res = await ProfileService.updateProfile(user.id, updates);
    if (res.success && res.profile) {
      setProfile(res.profile);
      if (updates.full_name) {
        setUser((prev) => (prev ? { ...prev, name: updates.full_name! } : null));
      }
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const updatePreferences = async (prefs: {
    defaultExam?: string;
    dailyQuestionGoal?: number;
    preferredDifficulty?: "Easy" | "Medium" | "Hard" | "Adaptive";
  }) => {
    if (!user) return { success: false, error: "Not authenticated" };
    const res = await ProfileService.updatePreferences(user.id, prefs);
    if (res.success) {
      await refreshProfile();
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isAuthenticated: Boolean(user),
        isConfigured: true,
        login,
        register,
        initiateRegistration,
        verifyRegistrationOtp,
        resendRegistrationOtp,
        logout,
        deleteAccount,
        resendConfirmationEmail,
        refreshProfile,
        updateProfile,
        updatePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
