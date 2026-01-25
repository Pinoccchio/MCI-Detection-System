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
      { label: "Pricing", href: "#pricing" },
    ],
    company: [
      { label: "About Us", href: "#about" },
      { label: "Research", href: "#research" },
      { label: "Contact", href: "#contact" },
      { label: "Careers", href: "#careers" },
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Brand Column */}
            <div className="lg:col-span-4">
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
            <div className="lg:col-span-2">
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

            <div className="lg:col-span-2">
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

            <div className="lg:col-span-2">
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

            {/* Newsletter Column */}
            <div className="lg:col-span-2">
              <h4 className="font-heading font-semibold text-sm text-foreground mb-4 uppercase tracking-wide">
                Stay Updated
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Get the latest updates on AI diagnostics research.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-shadow">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Disclaimer */}
        <div className="border-t border-border py-8">
          <div className="bg-amber-500/10 border-l-4 border-amber-500 rounded-lg p-4 mb-8">
            <h5 className="font-heading font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
              <span className="text-amber-500">⚠️</span>
              Medical Disclaimer
            </h5>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The MCI Detection System is designed as a clinical decision-support
              tool and is not intended to replace professional medical diagnosis,
              treatment, or clinical judgment. All diagnostic decisions should be
              made by qualified healthcare professionals. This system is
              currently under development and has not received FDA clearance or
              approval. Results should be interpreted in conjunction with other
              clinical findings and patient history.
            </p>
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
