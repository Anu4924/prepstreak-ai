"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  PenTool,
  CheckSquare,
  BarChart3,
  Flame,
  Settings,
  User,
} from "lucide-react";
import { useAuth } from "@/services/auth/auth-context";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Exams", href: "/exams", icon: GraduationCap },
  { label: "Learn", href: "/learn", icon: BookOpen },
  { label: "Practice", href: "/practice", icon: PenTool },
  { label: "Tests", href: "/tests", icon: CheckSquare },
  { label: "Progress", href: "/progress", icon: BarChart3 },
  { label: "Daily Challenge", href: "/daily-challenge", icon: Flame, badge: "New" },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const pathname = usePathname();
  const { profile } = useAuth();

  const isLinkActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 h-full bg-white border-r border-charcoal-200/80 flex flex-col justify-between select-none">
      <div>
        {/* Logo container */}
        <div className="h-16 px-6 flex items-center border-b border-charcoal-100">
          <Logo size="md" href="/dashboard" />
        </div>

        {/* Primary nav links */}
        <div className="p-4 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-charcoal-400">
            Study Platform
          </div>
          {MAIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-forest-900 text-white shadow-xs font-semibold"
                    : "text-charcoal-700 hover:bg-forest-50 hover:text-forest-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      active ? "text-white" : "text-charcoal-400 group-hover:text-forest-800"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      active
                        ? "bg-forest-800 text-almond-100"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom section (Settings & Profile + Exam goal preview) */}
      <div className="p-4 border-t border-charcoal-100 space-y-3">
        {/* Target exam pill */}
        <Link
          href="/exams"
          onClick={onCloseMobile}
          className="p-3 rounded-xl bg-almond-50 hover:bg-almond-100 border border-almond-200 flex items-center justify-between transition-colors group cursor-pointer"
          title="Click to view or switch your target exam"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-forest-600 animate-pulse" />
            <span className="text-xs font-semibold text-forest-950 group-hover:text-forest-800">
              Target:{" "}
              {profile?.currentExam && profile.currentExam !== "None"
                ? profile.currentExam
                : "Select Target"}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold text-forest-800 bg-almond-200/80 px-1.5 py-0.5 rounded group-hover:bg-forest-900 group-hover:text-white transition-colors">
            Switch
          </span>
        </Link>

        <div className="space-y-1">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-forest-900 text-white font-semibold"
                    : "text-charcoal-700 hover:bg-charcoal-100 hover:text-charcoal-900"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${active ? "text-white" : "text-charcoal-400"}`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
