"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/services/auth/auth-context";
import { AuthService } from "@/services/auth/auth-service";
import {
  Flame,
  ArrowRight,
  ShieldCheck,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  X,
  RotateCcw,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Forgot Password Wizard States (Step 1: Email, Step 2: Code + New Password)
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  // If already authenticated, redirect to dashboard or redirectTo
  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isAuthLoading, router, redirectTo]);

  const validateEmail = (val: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(val);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError("");
    setSuccessMessage("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError(
        "Please enter a valid email address (e.g., student@example.com)."
      );
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(trimmedEmail, password);
      if (res.success) {
        setSuccessMessage("Login successful! Redirecting to your dashboard...");
        setTimeout(() => {
          router.push(redirectTo);
          router.refresh();
        }, 300);
      } else {
        setError(
          res.error ||
            "Invalid email or password. Please verify your credentials and try again."
        );
      }
    } catch {
      setError("An unexpected error occurred while logging in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Send Reset Code Email
  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isResetting) return;

    setResetMessage(null);
    const trimmed = forgotEmail.trim();

    if (!validateEmail(trimmed)) {
      setResetMessage({
        text: "Please enter a valid email address.",
        isError: true,
      });
      return;
    }

    setIsResetting(true);
    try {
      const res = await AuthService.requestPasswordReset(trimmed);
      setResetMessage({
        text: res.message,
        isError: false,
      });
      // Move to Step 2 so user can enter the received code
      setForgotStep(2);
    } catch {
      setResetMessage({
        text: "Could not send reset instructions. Please try again later.",
        isError: true,
      });
    } finally {
      setIsResetting(false);
    }
  };

  // Step 2: Verify Code and Update Password
  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isResetting) return;

    setResetMessage(null);

    if (resetCode.trim().length !== 6) {
      setResetMessage({
        text: "Please enter the 6-digit verification code sent to your email.",
        isError: true,
      });
      return;
    }

    if (newPassword.length < 8) {
      setResetMessage({
        text: "New password must be at least 8 characters long.",
        isError: true,
      });
      return;
    }

    if (
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    ) {
      setResetMessage({
        text: "Password must include uppercase, lowercase, and numbers.",
        isError: true,
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setResetMessage({
        text: "Passwords do not match.",
        isError: true,
      });
      return;
    }

    setIsResetting(true);
    try {
      const res = await AuthService.confirmPasswordReset(
        forgotEmail.trim(),
        resetCode.trim(),
        newPassword,
        confirmNewPassword
      );

      if (res.success) {
        setResetMessage({
          text:
            res.message ||
            "Password has been reset successfully! You can now log in.",
          isError: false,
        });
        setEmail(forgotEmail.trim());
        setPassword("");
        setTimeout(() => {
          setIsForgotModalOpen(false);
          setForgotStep(1);
          setResetCode("");
          setNewPassword("");
          setConfirmNewPassword("");
          setResetMessage(null);
          setSuccessMessage("Password reset successful. Please sign in.");
        }, 2000);
      } else {
        setResetMessage({
          text: res.error || "Failed to reset password. Please try again.",
          isError: true,
        });
      }
    } catch {
      setResetMessage({
        text: "An error occurred while resetting your password.",
        isError: true,
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-50/50 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between mb-8">
        <Logo size="md" href="/" />
        <Link
          href="/"
          className="text-xs font-semibold text-charcoal-600 hover:text-forest-900 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Login Form Card */}
        <div className="lg:col-span-7">
          <Card
            variant="default"
            padding="lg"
            className="border border-charcoal-200/90 shadow-card"
          >
            <div className="mb-6">
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-forest-800 mb-1">
                PREPSTREAK AI
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-charcoal-900">
                Welcome back
              </h1>
              <p className="text-sm text-charcoal-500 mt-1">
                Sign in to continue your preparation.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="student@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
                disabled={isLoading}
              />

              <div>
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  isPasswordToggle
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                  disabled={isLoading}
                />

                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center gap-2 text-xs text-charcoal-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={isLoading}
                      className="rounded border-charcoal-300 text-forest-800 focus:ring-forest-700"
                    />
                    <span>Remember my session</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setForgotStep(1);
                      setResetMessage(null);
                      setIsForgotModalOpen(true);
                    }}
                    className="text-xs text-forest-800 hover:text-forest-950 font-medium hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                  isLoading={isLoading}
                  disabled={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
                >
                  {isLoading ? "Signing in..." : "Login"}
                </Button>
              </div>
            </form>

            {/* OR Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-charcoal-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-charcoal-400 font-semibold tracking-wider">
                  ---------------- OR ----------------
                </span>
              </div>
            </div>

            {/* Create New Account Section */}
            <div className="space-y-2 text-center">
              <div className="text-xs text-charcoal-500 font-medium">
                Don&apos;t have an account?
              </div>
              <Button
                href="/register"
                variant="outline"
                size="md"
                className="w-full justify-center text-charcoal-800 border-charcoal-300 hover:bg-charcoal-50 font-semibold"
              >
                Create New Account
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Side: Desktop Statistics Side Visual */}
        <div className="hidden lg:block lg:col-span-5 space-y-4">
          <div className="rounded-3xl bg-forest-900 text-white p-6 shadow-card border border-forest-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-800 text-amber-300 text-xs font-bold">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span>Daily Streak Tracker</span>
              </div>
              <span className="text-[11px] text-almond-200">Encrypted Persistent</span>
            </div>

            <h3 className="text-lg font-bold mb-1">Consistency is Everything</h3>
            <p className="text-xs text-almond-100 leading-relaxed mb-4">
              Aspirants who maintain active study streaks score 38% higher in
              sectional accuracy benchmarks.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-forest-800 text-center">
              <div className="p-3 rounded-2xl bg-forest-800/80">
                <div className="text-xs text-almond-200 font-medium">Verified Accounts</div>
                <div className="text-xl font-extrabold text-white mt-0.5">Secure</div>
              </div>
              <div className="p-3 rounded-2xl bg-forest-800/80">
                <div className="text-xs text-almond-200 font-medium">Axmok AI</div>
                <div className="text-xl font-extrabold text-amber-300 mt-0.5">Active</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-charcoal-200 bg-white p-4 text-xs text-charcoal-600 flex items-center gap-2.5 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-forest-700 shrink-0" />
            <span>
              Secure persistent session cookies. Passwords are never stored in
              plain text.
            </span>
          </div>
        </div>
      </div>

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-charcoal-200 space-y-4">
            <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-charcoal-900">
                  {forgotStep === 1 ? "Forgot Password" : "Set New Password"}
                </h3>
                <span className="text-[11px] text-forest-800 font-semibold">
                  Step {forgotStep} of 2
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="text-charcoal-400 hover:text-charcoal-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2.5 leading-relaxed ${
                  resetMessage.isError
                    ? "bg-rose-50 text-rose-800 border border-rose-200"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                }`}
              >
                {resetMessage.isError ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                )}
                <span>{resetMessage.text}</span>
              </div>
            )}

            {/* STEP 1: Enter Email */}
            {forgotStep === 1 && (
              <form onSubmit={handleRequestResetCode} className="space-y-4">
                <p className="text-xs text-charcoal-500 leading-relaxed">
                  Enter your registered email address and we&apos;ll dispatch a
                  secure 6-digit password reset verification code.
                </p>

                <Input
                  label="Registered Email"
                  type="email"
                  placeholder="student@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                  disabled={isResetting}
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsForgotModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isResetting}
                    disabled={isResetting}
                  >
                    {isResetting ? "Sending code..." : "Send Reset Code"}
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 2: Enter Code & New Password */}
            {forgotStep === 2 && (
              <form onSubmit={handleConfirmResetPassword} className="space-y-4">
                <div className="p-2.5 rounded-xl bg-charcoal-50 border border-charcoal-200/70 text-[11px] text-charcoal-600 flex items-center justify-between">
                  <span className="truncate">Sent to: <strong>{forgotEmail}</strong></span>
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-forest-800 font-bold hover:underline shrink-0 ml-2"
                  >
                    Change
                  </button>
                </div>

                <Input
                  label="6-Digit Reset Code"
                  placeholder="e.g. 123456"
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ""))}
                  required
                  disabled={isResetting}
                />

                <Input
                  label="New Password"
                  placeholder="At least 8 characters"
                  isPasswordToggle
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                  disabled={isResetting}
                />

                <Input
                  label="Confirm New Password"
                  placeholder="Re-enter your new password"
                  isPasswordToggle
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={
                    confirmNewPassword && newPassword !== confirmNewPassword
                      ? "Passwords do not match."
                      : undefined
                  }
                  required
                  disabled={isResetting}
                />

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleRequestResetCode}
                    disabled={isResetting}
                    className="text-xs text-forest-800 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Resend code</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsForgotModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={isResetting}
                      disabled={isResetting || resetCode.length !== 6 || !newPassword}
                    >
                      {isResetting ? "Updating..." : "Reset Password"}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Minimal Footer Note */}
      <div className="text-center text-xs text-charcoal-400 mt-8">
        © 2026 PrepStreak AI. Focused competitive exam preparation.
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-charcoal-50/50">
          <div className="text-xs text-charcoal-500 font-medium">Loading login...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
