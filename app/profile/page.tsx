"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/services/auth/auth-context";
import { AuthService } from "@/services/auth/auth-service";
import { CENTRAL_EXAM_CATALOGUE, getExamById } from "@/lib/data/examCatalogue";
import {
  GraduationCap,
  Save,
  Check,
  Calendar,
  Lock,
  LogOut,
  Flame,
  Award,
  CheckCircle2,
  BarChart3,
  AlertCircle,
  Sparkles,
  User,
  Shield,
  Clock,
} from "lucide-react";

// Preset avatar styles for students
const AVATAR_OPTIONS = [
  { id: "emerald", label: "Emerald Scholar", bg: "bg-emerald-900 text-almond-100" },
  { id: "forest", label: "Forest Aspirant", bg: "bg-forest-900 text-almond-100" },
  { id: "amber", label: "Golden Achiever", bg: "bg-amber-800 text-amber-100" },
  { id: "charcoal", label: "Executive Focus", bg: "bg-charcoal-900 text-almond-100" },
  { id: "indigo", label: "Analytical Mind", bg: "bg-indigo-900 text-indigo-100" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, logout, updateProfile, updatePreferences } = useAuth();

  // Form states
  const [name, setName] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [dailyGoal, setDailyGoal] = useState(20);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard" | "Adaptive">("Adaptive");
  const [avatarStyle, setAvatarStyle] = useState("forest");

  // Status feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Change Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState("");
  const [passError, setPassError] = useState("");

  // Logout state
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Sync profile into state
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setSelectedExam(profile.examId || profile.currentExam || "");
      setDailyGoal(profile.preferences?.dailyQuestionGoal || 20);
      setDifficulty(profile.preferences?.preferredDifficulty || "Adaptive");
      setAvatarStyle(profile.avatarUrl || "forest");
    } else if (user) {
      setName(user.user_metadata?.full_name || "");
      setSelectedExam(user.targetExamId || user.user_metadata?.selected_exam || "");
    }
  }, [profile, user]);

  const currentExamObj = selectedExam ? getExamById(selectedExam) : null;

  const getInitials = (fullName: string) => {
    if (!fullName) return "ST";
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    setSaveSuccess(false);

    if (!name.trim()) {
      setSaveError("Name cannot be empty.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateProfile({
        full_name: name.trim(),
        selected_exam: selectedExam,
        avatar_url: avatarStyle,
      });

      await updatePreferences({
        defaultExam: selectedExam,
        dailyQuestionGoal: dailyGoal,
        preferredDifficulty: difficulty,
      });

      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(res.error || "Failed to update profile.");
      }
    } catch {
      setSaveError("An error occurred while saving profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (!newPassword || newPassword.length < 8) {
      setPassError("New password must be at least 8 characters long.");
      return;
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setPassError("Password must include uppercase, lowercase, and a number.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError("Passwords do not match.");
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await AuthService.updatePassword(newPassword);
      if (res.success) {
        setPassSuccess("Password has been updated successfully.");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPassSuccess(""), 4000);
      } else {
        setPassError(res.error || "Failed to update password.");
      }
    } catch {
      setPassError("An error occurred while updating your password.");
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace("/login");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  };

  const activeAvatar = AVATAR_OPTIONS.find((a) => a.id === avatarStyle) || AVATAR_OPTIONS[1];

  return (
    <AppShell>
      <PageHeader
        title="Student Profile & Settings"
        subtitle="Manage your identity, competitive exam preferences, study targets, and account security."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Profile" },
        ]}
      />

      <div className="max-w-4xl mx-auto space-y-6 mb-12">
        {/* 1. Header Card with Avatar & Primary Metrics */}
        <Card variant="default" padding="lg" className="border border-charcoal-200/80 shadow-subtle">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-charcoal-100">
            {/* User Avatar with Initials */}
            <div
              className={`w-20 h-20 rounded-3xl ${activeAvatar.bg} flex items-center justify-center text-2xl font-extrabold shadow-md shrink-0 ring-4 ring-forest-50 transition-all`}
            >
              {getInitials(name || profile?.name || "Student")}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900">
                    {name || profile?.name || "Student Aspirant"}
                  </h2>
                  <p className="text-xs text-charcoal-500 mt-0.5 flex items-center justify-center sm:justify-start gap-1.5">
                    <User className="w-3.5 h-3.5 text-charcoal-400" />
                    {user?.email || profile?.email || "student@prepstreak.ai"}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-center sm:self-auto">
                  <Badge variant="forest" size="md">
                    <Sparkles className="w-3 h-3 mr-1 text-amber-300" />
                    Verified Aspirant
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    isLoading={isLoggingOut}
                    className="text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1" />
                    Logout
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-charcoal-600">
                <span className="flex items-center gap-1.5 font-semibold text-forest-900 bg-forest-50 px-2.5 py-1 rounded-lg border border-forest-200/60">
                  <GraduationCap className="w-4 h-4 text-forest-700" />
                  Target: {currentExamObj?.name || "Not selected yet"}
                </span>
                <span className="text-charcoal-300">•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-charcoal-400" />
                  Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : (profile?.joinDate || "Recently")}
                </span>
              </div>
            </div>
          </div>

          {/* 6 Comprehensive Learning Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 text-center">
            <div className="p-3 rounded-2xl bg-charcoal-50/80 border border-charcoal-200/50">
              <div className="text-[10px] text-charcoal-500 uppercase font-bold tracking-wider">
                Current Streak
              </div>
              <div className="text-base sm:text-lg font-extrabold text-amber-600 mt-0.5 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 fill-amber-500" />
                {profile?.currentStreak ?? 0}d
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-charcoal-50/80 border border-charcoal-200/50">
              <div className="text-[10px] text-charcoal-500 uppercase font-bold tracking-wider">
                Longest Streak
              </div>
              <div className="text-base sm:text-lg font-extrabold text-charcoal-900 mt-0.5 flex items-center justify-center gap-1">
                <Award className="w-4 h-4 text-forest-700" />
                {profile?.longestStreak ?? 0}d
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-charcoal-50/80 border border-charcoal-200/50">
              <div className="text-[10px] text-charcoal-500 uppercase font-bold tracking-wider">
                Solved Qs
              </div>
              <div className="text-base sm:text-lg font-extrabold text-charcoal-900 mt-0.5 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-forest-700" />
                {profile?.questionsSolved ?? 0}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-charcoal-50/80 border border-charcoal-200/50">
              <div className="text-[10px] text-charcoal-500 uppercase font-bold tracking-wider">
                Accuracy
              </div>
              <div className="text-base sm:text-lg font-extrabold text-forest-900 mt-0.5 flex items-center justify-center gap-1">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                {profile?.accuracy ?? 0}%
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-charcoal-50/80 border border-charcoal-200/50">
              <div className="text-[10px] text-charcoal-500 uppercase font-bold tracking-wider">
                Study Time
              </div>
              <div className="text-base sm:text-lg font-extrabold text-charcoal-900 mt-0.5 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-forest-700" />
                {profile?.studyTimeMinutes ? `${Math.floor(profile.studyTimeMinutes / 60)}h ${profile.studyTimeMinutes % 60}m` : "0m"}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-charcoal-50/80 border border-charcoal-200/50">
              <div className="text-[10px] text-charcoal-500 uppercase font-bold tracking-wider">
                Tests Taken
              </div>
              <div className="text-base sm:text-lg font-extrabold text-forest-950 mt-0.5">
                {profile?.testsCompleted ?? 0}
              </div>
            </div>
          </div>
        </Card>

        {/* 2. Editable Profile & Exam Preferences Form */}
        <Card variant="default" padding="lg" className="border border-charcoal-200/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-charcoal-900">
                Personal Details & Target Exam
              </h3>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Update your student identity and preparation targets.
              </p>
            </div>
          </div>

          {saveSuccess && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              Profile changes and study preferences successfully saved.
            </div>
          )}

          {saveError && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              {saveError}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Full Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              {/* Email (Read-only for security) */}
              <div>
                <label className="block text-xs font-semibold text-charcoal-800 mb-1.5 uppercase tracking-wider">
                  Email Address (Protected)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    value={user?.email || profile?.email || ""}
                    disabled
                    className="w-full bg-charcoal-100/70 border border-charcoal-200 rounded-xl text-charcoal-500 text-sm px-3.5 py-2.5 cursor-not-allowed"
                  />
                  <div className="absolute right-3 text-charcoal-400" title="Email is locked for security">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[11px] text-charcoal-400 mt-1">
                  Email cannot be modified directly without identity verification.
                </p>
              </div>
            </div>

            {/* Avatar Style Picker */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-2">
                Student Avatar Theme
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {AVATAR_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAvatarStyle(opt.id)}
                    className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      avatarStyle === opt.id
                        ? "border-forest-800 bg-forest-50/70 ring-2 ring-forest-700/30"
                        : "border-charcoal-200 bg-white hover:bg-charcoal-50"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl ${opt.bg} flex items-center justify-center text-xs font-bold shrink-0`}
                    >
                      {getInitials(name || "ST")}
                    </div>
                    <span className="text-xs font-medium text-charcoal-800 truncate">
                      {opt.label.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Examination Selector (Complete Catalogue) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="exam-select"
                  className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider"
                >
                  Primary Target Examination
                </label>
                <span className="text-[11px] text-forest-800 font-semibold">
                  {currentExamObj ? `${currentExamObj.category} • ${currentExamObj.difficulty}` : "Select target exam"}
                </span>
              </div>
              <select
                id="exam-select"
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full bg-white border border-charcoal-200 rounded-xl text-charcoal-900 text-sm px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-forest-800"
              >
                {CENTRAL_EXAM_CATALOGUE.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name} ({exam.category}) — {exam.officialName}
                  </option>
                ))}
              </select>
            </div>

            {/* Daily Goal & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="daily-goal"
                  className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1.5"
                >
                  Daily Questions Target
                </label>
                <select
                  id="daily-goal"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="w-full bg-white border border-charcoal-200 rounded-xl text-charcoal-900 text-sm px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-forest-800"
                >
                  <option value={10}>10 Questions / Day (Light Study)</option>
                  <option value={20}>20 Questions / Day (Standard Recommended)</option>
                  <option value={35}>35 Questions / Day (Intense Sprint)</option>
                  <option value={50}>50 Questions / Day (Full-Time Aspirant)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="difficulty"
                  className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-1.5"
                >
                  Preferred AI Tutor Difficulty
                </label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(e.target.value as "Easy" | "Medium" | "Hard" | "Adaptive")
                  }
                  className="w-full bg-white border border-charcoal-200 rounded-xl text-charcoal-900 text-sm px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-forest-800"
                >
                  <option value="Adaptive">Adaptive (AI matches student accuracy)</option>
                  <option value="Easy">Foundation (Easy - Concept Building)</option>
                  <option value="Medium">Prelims Benchmark (Medium)</option>
                  <option value="Hard">Mains Standard (Hard - Advanced)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-charcoal-100 flex items-center justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSaving}
                leftIcon={<Save className="w-4 h-4 mr-1" />}
              >
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* 3. Account Security: Change Password Card */}
        <Card variant="default" padding="lg" className="border border-charcoal-200/80">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-forest-700" />
            <h3 className="text-base font-bold text-charcoal-900">Account Security</h3>
          </div>
          <p className="text-xs text-charcoal-500 mb-4">
            Update your password securely. Minimum 8 characters with uppercase, lowercase, and a number required.
          </p>

          {passSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4" />
              {passSuccess}
            </div>
          )}

          {passError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {passError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="New Password"
                placeholder="At least 8 characters (Aa1)"
                isPasswordToggle
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <Input
                label="Confirm New Password"
                placeholder="Re-enter new password"
                isPasswordToggle
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                error={
                  confirmPassword && newPassword !== confirmPassword
                    ? "Passwords do not match."
                    : undefined
                }
                required
              />
            </div>

            <div className="flex items-center justify-end pt-2">
              <Button
                type="submit"
                variant="outline"
                size="sm"
                isLoading={isChangingPass}
                disabled={!newPassword || newPassword !== confirmPassword}
              >
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
