"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/services/auth/auth-context";
import {
  ArrowRight,
  User,
  Mail,
  Lock,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Check,
  X,
} from "lucide-react";

// TODO: Email verification / OTP can be added back later when a verified domain and email provider are configured.
// For now, registration creates the account directly and logs the user in immediately.

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // Password Requirements checklist checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "Empty", color: "bg-charcoal-200" };
    let score = 0;
    if (hasMinLength) score += 1;
    if (hasUppercase && hasLowercase) score += 1;
    if (hasNumber) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-rose-500" };
    if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
    if (score === 3) return { score: 3, label: "Good", color: "bg-emerald-500" };
    return { score: 4, label: "Strong", color: "bg-emerald-600" };
  };

  const strength = calculatePasswordStrength(password);

  const validateEmail = (val: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError("");
    setSuccessMessage("");

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    // 1. Validate required fields
    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Full name must be at least 2 characters long.");
      return;
    }

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    // 2. Validate email format
    if (!validateEmail(trimmedEmail)) {
      setError("Please enter a valid email address (e.g., student@example.com).");
      return;
    }

    // 3. Validate password requirements
    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, and numbers."
      );
      return;
    }

    // 4. Validate password confirmation
    if (!confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await register(
        trimmedName,
        trimmedEmail,
        password,
        confirmPassword
      );

      if (res.success) {
        setSuccessMessage("Account created successfully! Preparing your study dashboard...");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 500);
      } else {
        setError(res.error || "Unable to create account. Please try again.");
      }
    } catch {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-50/50 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between mb-6">
        <Logo size="md" href="/" />
        <Link
          href="/"
          className="text-xs font-semibold text-charcoal-600 hover:text-forest-900 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Main Container */}
      <div className="max-w-md mx-auto w-full">
        <Card variant="default" padding="lg" className="border border-charcoal-200/90 shadow-card">
          {/* Header */}
          <div className="mb-6">
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-forest-800 mb-1">
              PREPSTREAK AI
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-charcoal-900">
              Create Account
            </h1>
            <p className="text-sm text-charcoal-500 mt-1">
              Start building your daily competitive exam preparation streak.
            </p>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Create Account Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Ramesh Patel"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
              disabled={isLoading}
            />

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
                placeholder="At least 8 characters"
                autoComplete="new-password"
                isPasswordToggle
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
                disabled={isLoading}
              />

              {/* Password Strength Meter */}
              {password && (
                <div className="mt-2 space-y-2 p-3 rounded-xl bg-charcoal-50/70 border border-charcoal-200/60">
                  <div className="flex justify-between items-center text-[11px] font-medium text-charcoal-600">
                    <span>Password Strength:</span>
                    <span className="font-bold text-charcoal-900">{strength.label}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`rounded-full transition-all duration-300 ${
                          strength.score >= level ? strength.color : "bg-charcoal-200"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Requirements Checklist */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                    <div
                      className={`flex items-center gap-1 ${
                        hasMinLength ? "text-emerald-700 font-semibold" : "text-charcoal-400"
                      }`}
                    >
                      {hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>8+ Characters</span>
                    </div>
                    <div
                      className={`flex items-center gap-1 ${
                        hasUppercase ? "text-emerald-700 font-semibold" : "text-charcoal-400"
                      }`}
                    >
                      {hasUppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>Uppercase Letter</span>
                    </div>
                    <div
                      className={`flex items-center gap-1 ${
                        hasLowercase ? "text-emerald-700 font-semibold" : "text-charcoal-400"
                      }`}
                    >
                      {hasLowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>Lowercase Letter</span>
                    </div>
                    <div
                      className={`flex items-center gap-1 ${
                        hasNumber ? "text-emerald-700 font-semibold" : "text-charcoal-400"
                      }`}
                    >
                      {hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>Number (0-9)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              isPasswordToggle
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              error={
                confirmPassword && password !== confirmPassword
                  ? "Passwords do not match."
                  : undefined
              }
              required
              disabled={isLoading}
            />

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
                {isLoading ? "Creating account..." : "Create Account"}
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

          {/* Login Button */}
          <Button
            href="/login"
            variant="outline"
            size="md"
            className="w-full justify-center text-charcoal-800 border-charcoal-300 hover:bg-charcoal-50 font-semibold"
          >
            Already have an account? Login
          </Button>

          <div className="mt-4 pt-3 border-t border-charcoal-100/60 text-[11px] text-charcoal-400 flex items-center gap-1.5 justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
            <span>Secure encrypted authentication with persistent session cookies</span>
          </div>
        </Card>
      </div>

      {/* Minimal Footer Note */}
      <div className="text-center text-xs text-charcoal-400 mt-8">
        © 2026 PrepStreak AI. Focused competitive exam preparation.
      </div>
    </div>
  );
}
