/**
 * Authentication Service (Production-Ready Architecture)
 *
 * Implements real-world authentication using server-side storage, secure HTTP-only cookies,
 * 6-digit email OTP verification, password hashing, and zero-state data isolation.
 */

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  targetExamId: string;
  createdAt: Date;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    selected_exam?: string;
  };
}

export interface AuthSession {
  user: AuthUser | null;
  token?: string;
  isAuthenticated: boolean;
}

export interface AuthResult {
  success: boolean;
  session?: AuthSession;
  error?: string;
  message?: string;
  email?: string;
  resendCooldownSeconds?: number;
  isExpired?: boolean;
  isLocked?: boolean;
  isConfigurationError?: boolean;
}

export const AuthService = {
  /**
   * Retrieves the current authenticated user and session from the server.
   */
  async getCurrentSession(): Promise<AuthSession> {
    try {
      const res = await fetch("/api/auth/session", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        return { user: null, isAuthenticated: false };
      }

      const data = await res.json();
      if (data.isAuthenticated && data.user) {
        return {
          isAuthenticated: true,
          token: "session-active",
          user: {
            ...data.user,
            createdAt: new Date(data.user.createdAt),
          },
        };
      }

      return { user: null, isAuthenticated: false };
    } catch (err) {
      console.error("AuthService.getCurrentSession error:", err);
      return { user: null, isAuthenticated: false };
    }
  },

  /**
   * Logs in a user using email and password.
   */
  async loginWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          error:
            data.error ||
            "Invalid email or password. Please verify your credentials and try again.",
        };
      }

      return {
        success: true,
        session: {
          isAuthenticated: true,
          token: "session-active",
          user: {
            ...data.user,
            createdAt: new Date(data.user.createdAt),
          },
        },
      };
    } catch (err) {
      console.error("AuthService.loginWithEmail error:", err);
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      return { success: false, error: msg };
    }
  },

  /**
   * Registers a new user account directly (without email OTP).
   * Validates credentials, creates verified account immediately, and sets secure session.
   *
   * TODO: Email verification / OTP can be added later when a verified domain
   * and email delivery provider are configured.
   */
  async register(
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string,
    targetExamId: string = ""
  ): Promise<AuthResult> {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          confirmPassword,
          targetExamId: targetExamId || "",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || "Registration request failed. Please try again.",
        };
      }

      return {
        success: true,
        message: data.message || "Account created successfully.",
        session: {
          isAuthenticated: true,
          token: "session-active",
          user: {
            ...data.user,
            createdAt: new Date(data.user.createdAt),
          },
        },
      };
    } catch (err) {
      console.error("AuthService.register error:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Registration request failed. Please check your connection.";
      return { success: false, error: msg };
    }
  },

  /**
   * Initiates registration. In the current direct flow without OTP, this delegates to register().
   *
   * TODO: Email verification / OTP can be re-enabled later when a verified domain
   * and email delivery provider are configured.
   */
  async initiateRegistration(
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string,
    targetExamId: string = ""
  ): Promise<AuthResult> {
    return this.register(
      fullName,
      email,
      password,
      confirmPassword,
      targetExamId
    );
  },

  /**
   * Verifies 6-digit OTP and creates account.
   *
   * TODO: Email verification / OTP can be re-enabled later when a verified domain and email provider are configured.
   */
  async verifyRegistrationOtp(email: string, otp: string): Promise<AuthResult> {
    try {
      const res = await fetch("/api/auth/register/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || "Verification failed. Please try again.",
          isExpired: data.isExpired,
          isLocked: data.isLocked,
        };
      }

      return {
        success: true,
        message: data.message || "Email verified successfully.",
        session: {
          isAuthenticated: true,
          token: "session-active",
          user: {
            ...data.user,
            createdAt: new Date(data.user.createdAt),
          },
        },
      };
    } catch (err) {
      console.error("AuthService.verifyRegistrationOtp error:", err);
      const msg =
        err instanceof Error ? err.message : "Verification request failed.";
      return { success: false, error: msg };
    }
  },

  /**
   * Resends the 6-digit OTP code to the user's email address.
   *
   * TODO: Email verification / OTP can be re-enabled later when a verified domain and email provider are configured.
   */
  async resendRegistrationOtp(email: string): Promise<AuthResult> {
    try {
      const res = await fetch("/api/auth/register/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || "Failed to resend verification code.",
          resendCooldownSeconds: data.cooldownRemainingSeconds || 60,
          isConfigurationError: Boolean(data.isConfigurationError),
        };
      }

      return {
        success: true,
        message: data.message,
        resendCooldownSeconds: data.resendCooldownSeconds || 60,
      };
    } catch (err) {
      console.error("AuthService.resendRegistrationOtp error:", err);
      return {
        success: false,
        error: "Failed to connect to the server to resend code.",
      };
    }
  },

  /**
   * Logs out the user and clears session cookies on the server.
   */
  async logout(): Promise<void> {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.warn("AuthService.logout error:", err);
    }
  },

  /**
   * Sends a password reset request to the backend.
   */
  async requestPasswordReset(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      return {
        success: Boolean(data.success),
        message:
          data.message ||
          "If an account with this email exists, password reset instructions have been dispatched.",
      };
    } catch (err) {
      console.error("AuthService.requestPasswordReset error:", err);
      return {
        success: false,
        message:
          "Failed to connect to the authentication server. Please try again later.",
      };
    }
  },

  /**
   * Submits the 6-digit reset code and sets a new password.
   */
  async confirmPasswordReset(
    email: string,
    resetCode: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          resetCode: resetCode.trim(),
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || "Failed to reset password.",
        };
      }

      return {
        success: true,
        message: data.message || "Your password has been reset successfully.",
      };
    } catch (err) {
      console.error("AuthService.confirmPasswordReset error:", err);
      return {
        success: false,
        error: "Unable to process password reset. Please try again.",
      };
    }
  },

  /**
   * Updates user's password for an authenticated session.
   */
  async updatePassword(
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || "Failed to update password.",
        };
      }

      return { success: true };
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update password.";
      return { success: false, error: msg };
    }
  },

  /**
   * Permanently deletes the current user's account and personal data.
   */
  async deleteAccount(
    password: string
  ): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || "Failed to delete account.",
        };
      }

      return {
        success: true,
        message: data.message || "Account deleted successfully.",
      };
    } catch (err) {
      return {
        success: false,
        error: "Unable to delete account at this time.",
      };
    }
  },
};
