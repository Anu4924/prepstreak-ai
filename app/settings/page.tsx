"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/services/auth/auth-context";
import { AuthService } from "@/services/auth/auth-service";
import {
  CENTRAL_EXAM_CATALOGUE,
  getExamById,
} from "@/lib/data/examCatalogue";
import {
  Bell,
  Sliders,
  Moon,
  Sun,
  Shield,
  Check,
  Save,
  Trash2,
  Lock,
  User,
  Info,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const {
    user,
    profile,
    updateProfile,
    updatePreferences,
    logout,
    deleteAccount,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<
    "account" | "preferences" | "appearance" | "notifications" | "privacy" | "about"
  >("account");

  // Form states
  const [fullName, setFullName] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [dailyGoal, setDailyGoal] = useState(20);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard" | "Adaptive">("Adaptive");
  const [language, setLanguage] = useState("English");
  const [timerMode, setTimerMode] = useState("25m");

  // Notifications
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [practiceReminders, setPracticeReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [examUpdates, setExamUpdates] = useState(true);

  // Appearance
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");

  // Password Update
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState("");
  const [passError, setPassError] = useState("");

  // Feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Delete Account Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Sync profile into state
  useEffect(() => {
    if (profile) {
      setFullName(profile.name || user?.name || "");
      setSelectedExam(profile.examId || profile.currentExam || "");
      setDailyGoal(profile.preferences?.dailyQuestionGoal || 20);
      setDifficulty(profile.preferences?.preferredDifficulty || "Adaptive");
    } else if (user) {
      setFullName(user.name || "");
      setSelectedExam(user.targetExamId || "");
    }
  }, [profile, user]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const pRes = await updateProfile({
        full_name: fullName.trim(),
        selected_exam: selectedExam,
        daily_question_goal: dailyGoal,
        preferred_difficulty: difficulty,
      });

      await updatePreferences({
        defaultExam: selectedExam,
        dailyQuestionGoal: dailyGoal,
        preferredDifficulty: difficulty,
      });

      if (pRes.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(pRes.error || "Failed to save settings.");
      }
    } catch {
      setSaveError("An error occurred while saving your settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (!newPassword || newPassword.length < 8) {
      setPassError("Password must be at least 8 characters long.");
      return;
    }

    if (
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    ) {
      setPassError("Password must include uppercase, lowercase, and numbers.");
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
        setPassSuccess("Password updated successfully.");
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

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePassword) {
      setDeleteError("Please enter your account password to confirm deletion.");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      const res = await deleteAccount(deletePassword);
      if (res.success) {
        router.push("/login?deleted=true");
      } else {
        setDeleteError(res.error || "Failed to delete account. Please verify your password.");
        setIsDeleting(false);
      }
    } catch {
      setDeleteError("An error occurred while deleting your account.");
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
    router.refresh();
  };

  const tabs = [
    { id: "account", label: "Account & Profile", icon: User },
    { id: "preferences", label: "Study Preferences", icon: Sliders },
    { id: "appearance", label: "Appearance", icon: Sun },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "about", label: "About PrepStreak AI", icon: Info },
  ] as const;

  const currentExamObj = selectedExam ? getExamById(selectedExam) : null;

  return (
    <AppShell>
      <PageHeader
        title="Settings"
        subtitle="Manage your profile, target examination, reminders, appearance, and account security."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings" },
        ]}
      />

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-start mb-12">
        {/* Navigation Sidebar (4 cols) */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-charcoal-200/80 p-2 shadow-xs space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full p-3 rounded-xl text-left flex items-center gap-3 text-xs sm:text-sm font-semibold transition-all ${
                  active
                    ? "bg-forest-900 text-white shadow-xs"
                    : "text-charcoal-700 hover:bg-charcoal-100"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    active ? "text-white" : "text-charcoal-500"
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Panel (8 cols) */}
        <div className="md:col-span-8">
          <Card
            variant="default"
            padding="lg"
            className="border border-charcoal-200/80 shadow-subtle"
          >
            {saveSuccess && (
              <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                Settings saved successfully!
              </div>
            )}

            {saveError && (
              <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                {saveError}
              </div>
            )}

            {/* TAB 1: ACCOUNT & PROFILE */}
            {activeTab === "account" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-charcoal-900">
                    Account Information
                  </h3>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    Your personal profile and registered credentials.
                  </p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <Input
                    label="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your Full Name"
                    required
                  />

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-800 mb-1.5 uppercase tracking-wider">
                      Email Address (Verified)
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="email"
                        value={user?.email || profile?.email || ""}
                        disabled
                        className="w-full bg-charcoal-100/70 border border-charcoal-200 rounded-xl text-charcoal-500 text-sm px-3.5 py-2.5 cursor-not-allowed"
                      />
                      <div className="absolute right-3 flex items-center gap-1.5 text-forest-800">
                        <CheckCircle2 className="w-4 h-4 text-forest-700" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Verified</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-charcoal-400 mt-1">
                      Email address is cryptographically linked to your verified account.
                    </p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={isSaving}
                      leftIcon={<Save className="w-4 h-4 mr-1" />}
                    >
                      Save Profile
                    </Button>
                  </div>
                </form>

                {/* Change Password Sub-card */}
                <div className="pt-6 border-t border-charcoal-100 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-charcoal-900 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-forest-800" />
                      Change Password
                    </h4>
                    <p className="text-xs text-charcoal-500 mt-0.5">
                      Enter a new password with at least 8 characters, uppercase, lowercase, and numbers.
                    </p>
                  </div>

                  {passSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      {passSuccess}
                    </div>
                  )}

                  {passError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      {passError}
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-3">
                    <Input
                      label="New Password"
                      placeholder="At least 8 characters"
                      isPasswordToggle
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />

                    <Input
                      label="Confirm New Password"
                      placeholder="Re-enter new password"
                      isPasswordToggle
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />

                    <div className="flex justify-end pt-1">
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
                </div>
              </div>
            )}

            {/* TAB 2: STUDY PREFERENCES */}
            {activeTab === "preferences" && (
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-charcoal-900">
                    Study Engine Parameters
                  </h3>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    Customize your target competitive syllabus and daily practice cadence.
                  </p>
                </div>

                {/* Primary Target Exam: complete catalogue fully active and selectable */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="target-exam-select"
                      className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wide"
                    >
                      Primary Target Exam
                    </label>
                    <span className="text-[11px] text-forest-800 font-semibold">
                      {currentExamObj ? `${currentExamObj.category} • ${currentExamObj.difficulty}` : ""}
                    </span>
                  </div>
                  <select
                    id="target-exam-select"
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

                {/* Daily Question Quota */}
                <div>
                  <label
                    htmlFor="daily-quota-select"
                    className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wide mb-1.5"
                  >
                    Daily Question Quota
                  </label>
                  <select
                    id="daily-quota-select"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(Number(e.target.value))}
                    className="w-full bg-white border border-charcoal-200 rounded-xl text-charcoal-900 text-sm px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-forest-800"
                  >
                    <option value={10}>10 Questions / Day (Foundational Warm-Up)</option>
                    <option value={20}>20 Questions / Day (Recommended Standard)</option>
                    <option value={35}>35 Questions / Day (Intense Sprint)</option>
                    <option value={50}>50 Questions / Day (Full-Time Aspirant)</option>
                  </select>
                </div>

                {/* Question Difficulty Bias */}
                <div>
                  <label
                    htmlFor="difficulty-bias-select"
                    className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wide mb-1.5"
                  >
                    Question Difficulty Bias
                  </label>
                  <select
                    id="difficulty-bias-select"
                    value={difficulty}
                    onChange={(e) =>
                      setDifficulty(e.target.value as "Easy" | "Medium" | "Hard" | "Adaptive")
                    }
                    className="w-full bg-white border border-charcoal-200 rounded-xl text-charcoal-900 text-sm px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-forest-800"
                  >
                    <option value="Adaptive">Dynamic Adaptive (Automatic AI Adjustment)</option>
                    <option value="Easy">Easy (Foundational Concept Building)</option>
                    <option value="Medium">Medium (Prelims Benchmark Level)</option>
                    <option value="Hard">Hard (Mains Examination Standard)</option>
                  </select>
                </div>

                {/* Preferred Language */}
                <div>
                  <label
                    htmlFor="language-select"
                    className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wide mb-1.5"
                  >
                    Preferred Language
                  </label>
                  <select
                    id="language-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-white border border-charcoal-200 rounded-xl text-charcoal-900 text-sm px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-forest-800"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Bilingual">Bilingual (English + Regional Notes)</option>
                  </select>
                </div>

                {/* Study Session Timer */}
                <div>
                  <label
                    htmlFor="timer-select"
                    className="block text-xs font-semibold text-charcoal-800 uppercase tracking-wide mb-1.5"
                  >
                    Default Practice Session Timer
                  </label>
                  <select
                    id="timer-select"
                    value={timerMode}
                    onChange={(e) => setTimerMode(e.target.value)}
                    className="w-full bg-white border border-charcoal-200 rounded-xl text-charcoal-900 text-sm px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-forest-800"
                  >
                    <option value="15m">15 Minutes (Rapid Fire Sprint)</option>
                    <option value="25m">25 Minutes (Standard Pomodoro)</option>
                    <option value="45m">45 Minutes (Full Section Simulation)</option>
                    <option value="untimed">Untimed (Practice Mode)</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isSaving}
                    leftIcon={<Save className="w-4 h-4 mr-1" />}
                  >
                    Save Preferences
                  </Button>
                </div>
              </form>
            )}

            {/* TAB 3: APPEARANCE */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-charcoal-900">
                    Visual Interface
                  </h3>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    Customize your study ambiance and readability.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setThemeMode("light")}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-32 transition-all ${
                      themeMode === "light"
                        ? "border-forest-900 bg-white ring-2 ring-forest-900/30"
                        : "border-charcoal-200 bg-charcoal-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                        <Sun className="w-5 h-5" />
                      </div>
                      {themeMode === "light" && (
                        <Badge variant="forest" size="sm">
                          Active
                        </Badge>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-charcoal-900">Light Theme</div>
                      <div className="text-xs text-charcoal-500">Dark green + almond + white contrast</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setThemeMode("dark")}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-32 transition-all ${
                      themeMode === "dark"
                        ? "border-forest-900 bg-charcoal-900 text-white ring-2 ring-forest-900/30"
                        : "border-charcoal-200 bg-charcoal-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-charcoal-800 text-almond-200 flex items-center justify-center">
                        <Moon className="w-5 h-5" />
                      </div>
                      {themeMode === "dark" && (
                        <Badge variant="forest" size="sm">
                          Active
                        </Badge>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold">Dark Theme</div>
                      <div className="text-xs text-charcoal-400">Night preparation ambiance</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-charcoal-900">
                    Notifications & Reminders
                  </h3>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    Configure your daily study habit reminders and progress notifications.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-charcoal-50/70 border border-charcoal-200/80">
                    <div>
                      <div className="text-sm font-semibold text-charcoal-900">
                        Daily Streak Expiry Warning
                      </div>
                      <div className="text-xs text-charcoal-500">
                        Alert at 8:00 PM if today&apos;s question goal is incomplete.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={streakAlerts}
                      onChange={(e) => setStreakAlerts(e.target.checked)}
                      className="w-4 h-4 rounded text-forest-800 focus:ring-forest-800 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-charcoal-50/70 border border-charcoal-200/80">
                    <div>
                      <div className="text-sm font-semibold text-charcoal-900">
                        Practice Session Reminders
                      </div>
                      <div className="text-xs text-charcoal-500">
                        Receive personalized prompts to review diagnosed weak topics.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={practiceReminders}
                      onChange={(e) => setPracticeReminders(e.target.checked)}
                      className="w-4 h-4 rounded text-forest-800 focus:ring-forest-800 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-charcoal-50/70 border border-charcoal-200/80">
                    <div>
                      <div className="text-sm font-semibold text-charcoal-900">
                        Weekly Performance Report
                      </div>
                      <div className="text-xs text-charcoal-500">
                        Receive a breakdown of your accuracy gains and study time every Sunday.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={weeklyDigest}
                      onChange={(e) => setWeeklyDigest(e.target.checked)}
                      className="w-4 h-4 rounded text-forest-800 focus:ring-forest-800 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-charcoal-50/70 border border-charcoal-200/80">
                    <div>
                      <div className="text-sm font-semibold text-charcoal-900">
                        Official Exam Notification Updates
                      </div>
                      <div className="text-xs text-charcoal-500">
                        Alerts on admit card releases, date revisions, and application cutoffs.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={examUpdates}
                      onChange={(e) => setExamUpdates(e.target.checked)}
                      className="w-4 h-4 rounded text-forest-800 focus:ring-forest-800 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: PRIVACY & SECURITY (Active Session, Logout, Delete Account) */}
            {activeTab === "privacy" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-charcoal-900">
                    Active Session & Security
                  </h3>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    Manage your active cryptographic sessions and account deletion.
                  </p>
                </div>

                {/* Active Session Info Box */}
                <div className="p-4 rounded-2xl bg-charcoal-50/80 border border-charcoal-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-charcoal-600 font-medium">Session Status:</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Active & Protected
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-charcoal-600">Session Cookie:</span>
                    <span className="font-mono text-charcoal-800 text-[11px]">HTTP-Only • Secure • SameSite=Lax</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-charcoal-600">Authenticated User ID:</span>
                    <span className="font-mono text-charcoal-800 text-[11px] truncate max-w-[200px]">
                      {user?.id || "Active"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <div className="text-xs font-bold text-charcoal-800">End Current Session</div>
                    <div className="text-[11px] text-charcoal-500">Sign out of PrepStreak AI on this device</div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-xs text-charcoal-700"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1" />
                    Logout
                  </Button>
                </div>

                {/* DANGER ZONE: DELETE ACCOUNT */}
                <div className="pt-6 border-t border-rose-200 space-y-3">
                  <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-rose-950 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        Danger Zone: Delete Account
                      </h4>
                      <p className="text-xs text-rose-800 mt-1 max-w-md leading-relaxed">
                        Permanently delete your user account, study streak, tests, and progress telemetry. This operation cannot be undone.
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDeleteError("");
                        setDeletePassword("");
                        setIsDeleteModalOpen(true);
                      }}
                      className="border-rose-300 text-rose-700 hover:bg-rose-100 hover:text-rose-900 shrink-0 font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: ABOUT */}
            {activeTab === "about" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-charcoal-900">
                    About PrepStreak AI
                  </h3>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    Platform specifications and examination coverage standards.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-charcoal-50/80 border border-charcoal-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-charcoal-600">Application:</span>
                      <span className="font-bold text-charcoal-900">PrepStreak AI</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-charcoal-600">Production Build:</span>
                      <span className="font-mono text-charcoal-800 text-[11px]">v1.0.0 (Production Release)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-charcoal-600">Exam Catalogue:</span>
                      <span className="font-semibold text-forest-900">
                        {CENTRAL_EXAM_CATALOGUE.length} Official Syllabi Covered
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-charcoal-600">AI Study Engine:</span>
                      <span className="font-semibold text-charcoal-900">Axmok AI Multi-Turn Tutor</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-charcoal-600">Authentication:</span>
                      <span className="font-semibold text-charcoal-900">Bcrypt Salted + HMAC-SHA256 Sessions</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-almond-50 border border-almond-200 text-xs text-charcoal-700 leading-relaxed">
                    PrepStreak AI is designed to build rigorous daily study discipline for competitive aspirants. All questions and practice sets align directly with official exam syllabus blueprints.
                  </div>

                  <div className="flex items-center gap-4 text-xs text-forest-800 font-semibold pt-2">
                    <Link href="/exams" className="hover:underline flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      Browse Exam Syllabi
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ================= CONFIRM DELETE ACCOUNT MODAL ================= */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-charcoal-200 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-700">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-charcoal-900">
                  Delete Your Account?
                </h3>
                <p className="text-xs text-rose-600 font-medium">
                  This action is irreversible and permanent.
                </p>
              </div>
            </div>

            <p className="text-xs text-charcoal-600 leading-relaxed">
              All your study records, practice history, tests, accuracy analytics,
              and daily streak data will be wiped permanently from our systems.
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                {deleteError}
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-4 pt-1">
              <Input
                label="Confirm Your Password"
                type="password"
                placeholder="Enter your account password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                isPasswordToggle
                required
                disabled={isDeleting}
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isDeleting}
                  className="bg-rose-700 hover:bg-rose-800 text-white border-rose-700"
                >
                  Permanently Delete My Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
