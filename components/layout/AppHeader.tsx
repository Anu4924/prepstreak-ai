"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Flame,
  ChevronDown,
  Bell,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import { getExamById } from "@/lib/data/examCatalogue";
import { useAuth } from "@/services/auth/auth-context";
import { ChangeTargetExamModal } from "@/components/exams/ChangeTargetExamModal";

interface AppHeaderProps {
  onOpenMobileMenu: () => void;
}

export function AppHeader({ onOpenMobileMenu }: AppHeaderProps) {
  const router = useRouter();
  const { user, profile, logout, updatePreferences, updateProfile } = useAuth();

  const [isChangeTargetModalOpen, setIsChangeTargetModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const currentExamObj = profile?.examId ? getExamById(profile.examId) : null;
  const selectedExamName =
    currentExamObj?.name ||
    (profile?.currentExam && profile.currentExam !== "None"
      ? profile.currentExam
      : "Choose Target Exam");

  const streakDays = profile?.currentStreak ?? 0;

  const getInitials = (fullName?: string) => {
    if (!fullName) return "ST";
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  const handleSelectExam = async (examId: string) => {
    await updatePreferences({ defaultExam: examId });
    await updateProfile({ selected_exam: examId });
  };

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    router.replace("/login");
    router.refresh();
  };

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 h-16 w-full bg-white/95 backdrop-blur-md border-b border-charcoal-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-charcoal-700 hover:text-charcoal-900 rounded-lg hover:bg-charcoal-100"
            aria-label="Open navigation sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Target Exam Selector Button -> Opens "Change Target Exam" Modal */}
          <button
            type="button"
            onClick={() => setIsChangeTargetModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-charcoal-200 bg-almond-50/80 hover:bg-almond-100 text-charcoal-900 text-xs sm:text-sm font-semibold transition-all hover:border-forest-700/50 shadow-2xs"
            title="Click to change your target examination"
          >
            <span className="w-2 h-2 rounded-full bg-forest-700 animate-pulse" />
            <span className="truncate max-w-[140px] sm:max-w-[220px]">
              Target: {selectedExamName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-charcoal-500 shrink-0" />
          </button>
        </div>

        {/* Right side items: Streak pill, notification, user avatar with dropdown */}
        <div className="flex items-center gap-3">
          {/* Streak indicator */}
          <Link
            href="/streak"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 hover:bg-amber-100 transition-colors"
            title="Daily Study Streak"
          >
            <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span className="text-xs font-bold tracking-tight">{streakDays} Days</span>
          </Link>

          {/* Notifications */}
          <button
            type="button"
            className="p-2 text-charcoal-500 hover:text-charcoal-800 hover:bg-charcoal-100 rounded-xl relative focus:outline-hidden"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-forest-700" />
          </button>

          {/* Profile Avatar & Dropdown Menu */}
          <div className="relative pl-2 border-l border-charcoal-200" ref={userDropdownRef}>
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 focus:outline-hidden group"
              aria-label="User profile menu"
            >
              <div className="w-8 h-8 rounded-xl bg-forest-900 text-almond-100 flex items-center justify-center text-xs font-bold ring-2 ring-forest-100 group-hover:ring-forest-300 transition-all">
                {getInitials(profile?.name || user?.name || user?.user_metadata?.full_name)}
              </div>
              <span className="hidden md:inline-block text-xs font-semibold text-charcoal-800 max-w-[120px] truncate">
                {profile?.name || user?.name || user?.user_metadata?.full_name || "Student"}
              </span>
              <ChevronDown className="hidden md:inline-block w-3 h-3 text-charcoal-400 group-hover:text-charcoal-700 transition-colors" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-charcoal-200 shadow-xl py-2 z-50 text-sm animate-in fade-in-50 duration-100">
                <div className="px-4 py-2 border-b border-charcoal-100">
                  <div className="text-xs font-bold text-charcoal-900 truncate">
                    {profile?.name || user?.name || user?.user_metadata?.full_name || "Student Aspirant"}
                  </div>
                  <div className="text-[11px] text-charcoal-500 truncate">
                    {user?.email || profile?.email || "student@prepstreak.ai"}
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-charcoal-700 hover:bg-forest-50 hover:text-forest-900 transition-colors"
                  >
                    <User className="w-4 h-4 text-charcoal-400" />
                    <span>Profile & Preferences</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-charcoal-700 hover:bg-forest-50 hover:text-forest-900 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-charcoal-400" />
                    <span>Settings</span>
                  </Link>
                </div>

                <div className="border-t border-charcoal-100 pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Change Target Exam Modal */}
      <ChangeTargetExamModal
        isOpen={isChangeTargetModalOpen}
        currentExamId={profile?.examId}
        onClose={() => setIsChangeTargetModalOpen(false)}
        onSelectExam={handleSelectExam}
      />
    </>
  );
}
