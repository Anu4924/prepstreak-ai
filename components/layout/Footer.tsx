import React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="border-t border-charcoal-200 bg-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand info */}
          <div className="col-span-2">
            <Logo size="md" />
            <p className="text-sm text-charcoal-500 mt-3 max-w-sm">
              The AI-powered government competitive exam preparation platform. Practice
              intelligently, identify weak topics, and build daily study consistency.
            </p>
          </div>

          {/* Column: Exams */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-900 mb-3">
              Exams
            </h4>
            <ul className="space-y-2 text-sm text-charcoal-600">
              <li>
                <Link href="/exams/sbi-po" className="hover:text-forest-900 transition-colors">
                  SBI PO
                </Link>
              </li>
              <li>
                <Link href="/exams/ssc-cgl" className="hover:text-forest-900 transition-colors">
                  SSC CGL
                </Link>
              </li>
              <li>
                <Link href="/exams/rrb-ntpc" className="hover:text-forest-900 transition-colors">
                  RRB NTPC
                </Link>
              </li>
              <li>
                <Link href="/exams/upsc-cse" className="hover:text-forest-900 transition-colors">
                  UPSC CSE
                </Link>
              </li>
              <li>
                <Link href="/exams/tnpsc-group-4" className="hover:text-forest-900 transition-colors">
                  TNPSC Group 4
                </Link>
              </li>
              <li>
                <Link href="/exams" className="text-forest-800 font-semibold hover:underline transition-colors">
                  All 16 Categories →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Platform */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-900 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-charcoal-600">
              <li>
                <Link href="/#features" className="hover:text-forest-900 transition-colors">
                  AI Tutor
                </Link>
              </li>
              <li>
                <Link href="/practice" className="hover:text-forest-900 transition-colors">
                  AI Practice
                </Link>
              </li>
              <li>
                <Link href="/tests" className="hover:text-forest-900 transition-colors">
                  Smart Tests
                </Link>
              </li>
              <li>
                <Link href="/progress" className="hover:text-forest-900 transition-colors">
                  Progress Tracking
                </Link>
              </li>
              <li>
                <Link href="/streak" className="hover:text-forest-900 transition-colors">
                  Daily Streak
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Organization */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-900 mb-3">
              Company
            </h4>
            <ul className="space-y-2 text-sm text-charcoal-600">
              <li>
                <Link href="/#about" className="hover:text-forest-900 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-forest-900 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/#privacy" className="hover:text-forest-900 transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/#terms" className="hover:text-forest-900 transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-charcoal-200/70 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-500 gap-4">
          <p>© 2026 PrepStreak AI. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span className="text-forest-800 font-medium">Focused Government Exam Prep</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
