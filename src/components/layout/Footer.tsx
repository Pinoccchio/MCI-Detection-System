"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: "Features", href: "#features" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "User Roles", href: "#roles" },
    ],
    company: [
      { label: "About Us", href: "#about" },
      { label: "Research", href: "/research" },
      { label: "Contact", href: "/contact" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "HIPAA Compliance", href: "/hipaa" },
      { label: "Data Security", href: "/security" },
    ],
  };

  return (
    <footer className="bg-gradient-to-b from-background to-accent/5 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Column */}
            <div>
              <Link href="/" className="flex items-center gap-3 group mb-4">
                <Image
                  src="/logo.png"
                  alt="MCI Detect Logo"
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <h3 className="font-heading font-semibold text-lg tracking-tight text-foreground">
                    MCI Detect
                  </h3>
                  <p className="text-[10px] text-muted-foreground tracking-wide uppercase">
                    AI Diagnostics
                  </p>
                </div>
              </Link>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-sm">
                Advanced 2D CNN-based medical imaging software for early
                Alzheimer's detection through hippocampal analysis and MCI
                classification.
              </p>

              {/* Contact Info */}
              <div className="space-y-2">
                <a
                  href="mailto:marealeigh@gmail.com"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  marealeigh@gmail.com
                </a>
                <a
                  href="tel:+639176398932"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  +63 917 639 8932
                </a>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  1257-E Mataas Na Lupa St. Malate, Manila
                </div>
              </div>
            </div>

            {/* Links Columns */}
            <div>
              <h4 className="font-heading font-semibold text-sm text-foreground mb-4 uppercase tracking-wide">
                Product
              </h4>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-semibold text-sm text-foreground mb-4 uppercase tracking-wide">
                Company
              </h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-semibold text-sm text-foreground mb-4 uppercase tracking-wide">
                Legal
              </h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border py-6">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            {/* Copyright */}
            <p className="text-sm text-muted-foreground">
              © {currentYear} MCI Detect. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
