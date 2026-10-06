"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Menu, X, ArrowRight, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/services/auth/auth-context";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, profile, user } = useAuth();

  const navLinks = [
    { label: "Exams", href: "/exams" },
    { label: "Features", href: "/#features" },
    { label: "How It Works", href: "/#how-it-works" },
  ];

  const displayName = profile?.name || user?.user_metadata?.full_name || "Student";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-charcoal-200/80 bg-white/95 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Logo size="md" />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-charcoal-700">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-forest-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA actions */}
        <div className="hidden md:flex items-center space-x-3">
          {isAuthenticated ? (
            <Button
              variant="primary"
              size="sm"
              href="/dashboard"
              leftIcon={<LayoutDashboard className="w-4 h-4 mr-1" />}
              rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
            >
              Dashboard ({displayName.split(" ")[0]})
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" href="/login">
                Login
              </Button>
              <Button
                variant="primary"
                size="sm"
                href="/register"
                rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                Start Preparing
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-charcoal-700 hover:text-charcoal-900 rounded-lg hover:bg-charcoal-100 focus:outline-hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-charcoal-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top duration-150">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-base font-medium text-charcoal-800 hover:bg-forest-50 hover:text-forest-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-charcoal-100 flex flex-col space-y-2">
            {isAuthenticated ? (
              <Button
                variant="primary"
                size="md"
                href="/dashboard"
                className="w-full justify-center"
                onClick={() => setMobileMenuOpen(false)}
                leftIcon={<LayoutDashboard className="w-4 h-4 mr-1" />}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="md"
                  href="/login"
                  className="w-full justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  href="/register"
                  className="w-full justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start Preparing
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
