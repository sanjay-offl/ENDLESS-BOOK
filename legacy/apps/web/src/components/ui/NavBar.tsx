"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { auth, signInWithPopup, googleProvider, signOut } from "@/lib/firebase";
import { Button } from "./Button";

export function NavBar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/book", label: "The Book" },
    { href: "/map", label: "The Map" },
    { href: "/write", label: "Write" },
    { href: "/about", label: "About" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
        scrolled
          ? "bg-canvas border-b border-hairline py-3.5"
          : "bg-transparent border-b border-transparent py-5"
      }`}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 sm:px-10 md:px-16">
        {/* Wordmark */}
        <Link
          href="/"
          className="font-serif italic text-xl sm:text-2xl text-ink font-normal tracking-tight focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-4"
        >
          What I Saw
        </Link>

        {/* Center / Right anchor links in italic */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`font-serif italic text-base transition-colors duration-200 ${
                  isActive
                    ? "text-ink underline underline-offset-4 decoration-1 decoration-ink"
                    : "text-ink/75 hover:text-ink"
                } focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2`}
              >
                {label}
              </Link>
            );
          })}

          {user && (
            <Link
              href="/me"
              className={`font-serif italic text-base transition-colors duration-200 ${
                pathname === "/me"
                  ? "text-ink underline underline-offset-4 decoration-1 decoration-ink"
                  : "text-ink/75 hover:text-ink"
              }`}
            >
              My Chapters
            </Link>
          )}
        </nav>

        {/* Action button & Auth */}
        <div className="hidden md:flex items-center gap-4">
          {!loading && (
            <>
              {user ? (
                <button
                  type="button"
                  onClick={() => signOut(auth)}
                  className="text-xs uppercase tracking-wider text-muted hover:text-ink font-medium transition-colors"
                >
                  Sign out
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => signInWithPopup(auth, googleProvider)}
                  className="text-xs uppercase tracking-wider text-muted hover:text-ink font-medium transition-colors"
                >
                  Sign in
                </button>
              )}
            </>
          )}

          <Button href="/write" size="sm" variant="primary" arrow>
            Write a chapter
          </Button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-3">
          <Button href="/write" size="sm" variant="primary" arrow={false} className="px-4 py-1.5 text-xs">
            Write
          </Button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-1.5 text-ink font-serif italic text-xl focus-visible:outline-2 focus-visible:outline-ink"
          >
            {mobileMenuOpen ? "×" : "Menu"}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Solid canvas, hairline border, no blur) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-canvas border-b border-hairline px-6 py-6 space-y-4 animate-fade-in">
          <div className="flex flex-col space-y-4">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="font-serif italic text-2xl text-ink"
              >
                {label}
              </Link>
            ))}
            {user && (
              <Link href="/me" className="font-serif italic text-2xl text-ink">
                My Chapters
              </Link>
            )}
          </div>

          <div className="pt-4 border-t border-hairline flex items-center justify-between">
            {user ? (
              <button
                type="button"
                onClick={() => signOut(auth)}
                className="text-xs uppercase tracking-wider text-muted"
              >
                Sign out
              </button>
            ) : (
              <button
                type="button"
                onClick={() => signInWithPopup(auth, googleProvider)}
                className="text-xs uppercase tracking-wider text-muted"
              >
                Sign in with Google
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
