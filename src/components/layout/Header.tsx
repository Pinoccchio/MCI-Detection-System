"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthModal } from "@/components/auth/AuthModalProvider";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { openSignIn, openSignUp } = useAuthModal();
  const { scrollY } = useScroll();
  const headerBackground = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.95)"]
  );
  const headerShadow = useTransform(
    scrollY,
    [0, 100],
    ["0px 0px 0px rgba(0, 0, 0, 0)", "0px 4px 20px rgba(0, 0, 0, 0.08)"]
  );

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#roles", label: "User Roles" },
    { href: "#about", label: "About" },
  ];

  return (
    <>
      <motion.header
        style={{
          backgroundColor: headerBackground,
          boxShadow: headerShadow,
        }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="relative"
              >
                <Image
                  src="/logo.png"
                  alt="MCI Detect Logo"
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain"
                  priority
                />
              </motion.div>
              <div>
                <h1 className="font-heading font-semibold text-lg tracking-tight text-foreground">
                  MCI Detect
                </h1>
                <p className="text-[10px] text-muted-foreground tracking-wide uppercase">
                  AI Diagnostics
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </nav>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={openSignIn}>
                Sign In
              </Button>
              <Button size="sm" className="shadow-lg shadow-primary/25" onClick={openSignUp}>
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-foreground hover:bg-accent rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <motion.div
        initial={false}
        animate={{
          opacity: isMenuOpen ? 1 : 0,
          pointerEvents: isMenuOpen ? "auto" : "none",
        }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-background/95 backdrop-blur-lg z-40 md:hidden"
        style={{ top: "64px" }}
      >
        <motion.nav
          initial={false}
          animate={{
            y: isMenuOpen ? 0 : -20,
            opacity: isMenuOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="container mx-auto px-4 py-8 flex flex-col gap-6"
        >
          {navLinks.map((link, index) => (
            <motion.div
              key={link.href}
              initial={false}
              animate={{
                opacity: isMenuOpen ? 1 : 0,
                x: isMenuOpen ? 0 : -20,
              }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
            >
              <Link
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl font-heading font-semibold text-foreground hover:text-primary transition-colors block"
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
          <motion.div
            initial={false}
            animate={{
              opacity: isMenuOpen ? 1 : 0,
              y: isMenuOpen ? 0 : 20,
            }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="flex flex-col gap-3 mt-4"
          >
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => {
                setIsMenuOpen(false);
                openSignIn();
              }}
            >
              Sign In
            </Button>
            <Button
              size="lg"
              className="w-full shadow-lg shadow-primary/25"
              onClick={() => {
                setIsMenuOpen(false);
                openSignUp();
              }}
            >
              Get Started
            </Button>
          </motion.div>
        </motion.nav>
      </motion.div>

      {/* Spacer to prevent content jump */}
      <div className="h-16 lg:h-20" />
    </>
  );
}
