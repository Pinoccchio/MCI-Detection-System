import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, Eye, FileText, AlertCircle, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | MCI Detection System",
  description: "Privacy policy and data protection practices for the MCI Detection System medical imaging platform.",
};

export default function PrivacyPage() {
  const lastUpdated = "January 26, 2026";

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            ← Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <Shield className="h-8 w-8 text-primary" strokeWidth={2} />
            </div>
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground">
              Privacy Policy
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Your privacy and the security of patient medical data are our highest
            priorities. This policy explains how we collect, use, and protect
            information in the MCI Detection System.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        {/* Introduction */}
        <section className="mb-12">
          <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-6">
            <h2 className="font-heading font-bold text-2xl text-foreground mb-3">
              Overview
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The MCI Detection System ("System", "we", "us", or "our") is committed
              to protecting the privacy and security of protected health information
              (PHI) and personal data in compliance with HIPAA (Health Insurance
              Portability and Accountability Act) and applicable data protection laws.
            </p>
          </div>
        </section>

        {/* 1. Information We Collect */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-6 w-6 text-primary" />
            <h2 className="font-heading font-bold text-2xl text-foreground">
              1. Information We Collect
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                1.1 Medical Imaging Data
              </h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>MRI scans in DICOM format uploaded to the system</li>
                <li>Hippocampal-segmented masks and binary image data</li>
                <li>Manual hippocampal tracings created by radiologists</li>
                <li>CNN analysis results and classification probabilities</li>
                <li>Grad-CAM visualization heatmaps</li>
                <li>Hippocampal volumetry measurements and atrophy indicators</li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                1.2 User Account Information
              </h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Full name, email address, and contact phone number</li>
                <li>Professional role (Admin/Radiologist, Clinician/Neurologist, or Researcher)</li>
                <li>Institution or organization affiliation</li>
                <li>Authentication credentials (encrypted passwords)</li>
                <li>User access logs and system activity</li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                1.3 Technical Information
              </h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>IP addresses and device information</li>
                <li>Browser type and operating system</li>
                <li>Session duration and feature usage analytics</li>
                <li>Error logs and system performance data</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 2. How We Use Information */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Eye className="h-6 w-6 text-accent" />
            <h2 className="font-heading font-bold text-2xl text-foreground">
              2. How We Use Information
            </h2>
          </div>

          <div className="space-y-4 text-muted-foreground">
            <p>We process medical imaging data and personal information solely for:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Performing 2D CNN analysis on hippocampal masks to classify MCI/CN status</li>
              <li>Generating Grad-CAM visualizations and volumetric analysis</li>
              <li>Creating PDF reports for clinical documentation</li>
              <li>Managing user accounts and role-based access control</li>
              <li>Maintaining system security and preventing unauthorized access</li>
              <li>Improving CNN model performance through aggregated research (with explicit consent)</li>
              <li>Providing technical support and troubleshooting</li>
              <li>Complying with legal and regulatory obligations</li>
            </ul>
          </div>
        </section>

        {/* 3. Data Storage and Security */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="h-6 w-6 text-primary" />
            <h2 className="font-heading font-bold text-2xl text-foreground">
              3. Data Storage and Security
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                3.1 Encryption
              </h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>All data transmitted to and from the System uses TLS 1.3 encryption</li>
                <li>Patient MRI files and analysis results are encrypted at rest using AES-256</li>
                <li>Database credentials and API keys are stored in secure, encrypted vaults</li>
                <li>User passwords are hashed using industry-standard bcrypt algorithms</li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                3.2 Data Retention
              </h3>
              <p className="text-muted-foreground mb-2">
                We retain medical imaging data and analysis results according to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Patient records: Retained for the duration required by applicable medical records laws</li>
                <li>User account data: Retained while account is active, deleted within 30 days of account closure</li>
                <li>System logs: Retained for 12 months for security and audit purposes</li>
                <li>De-identified research data: May be retained indefinitely for model improvement with explicit consent</li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                3.3 Access Controls
              </h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Role-based access control (RBAC) limits data access to authorized users only</li>
                <li>Multi-factor authentication (MFA) available for enhanced security</li>
                <li>All data access is logged and auditable</li>
                <li>Regular security audits and penetration testing</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. Data Sharing */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <h2 className="font-heading font-bold text-2xl text-foreground">
              4. Data Sharing and Disclosure
            </h2>
          </div>

          <div className="space-y-4 text-muted-foreground">
            <p className="font-semibold text-foreground">
              We do NOT sell, rent, or trade protected health information or personal data.
            </p>
            <p>We may share information only in the following circumstances:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><span className="font-semibold text-foreground">Healthcare Providers:</span> With authorized clinical staff within your institution for treatment purposes</li>
              <li><span className="font-semibold text-foreground">Business Associates:</span> With HIPAA-compliant service providers (hosting, database management) under signed Business Associate Agreements</li>
              <li><span className="font-semibold text-foreground">Legal Requirements:</span> When required by law, court order, or regulatory authority</li>
              <li><span className="font-semibold text-foreground">Research:</span> Only with explicit consent and after de-identification per HIPAA Safe Harbor standards</li>
            </ul>
          </div>
        </section>

        {/* 5. Patient Rights */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-6 w-6 text-accent" />
            <h2 className="font-heading font-bold text-2xl text-foreground">
              5. Patient Rights Under HIPAA
            </h2>
          </div>

          <div className="space-y-4 text-muted-foreground">
            <p>Patients whose data is processed by this System have the right to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><span className="font-semibold text-foreground">Access:</span> Request copies of their medical imaging data and analysis results</li>
              <li><span className="font-semibold text-foreground">Amendment:</span> Request corrections to inaccurate or incomplete information</li>
              <li><span className="font-semibold text-foreground">Accounting:</span> Receive an accounting of disclosures of their PHI</li>
              <li><span className="font-semibold text-foreground">Restriction:</span> Request restrictions on certain uses or disclosures</li>
              <li><span className="font-semibold text-foreground">Confidential Communications:</span> Request communications through alternative means</li>
              <li><span className="font-semibold text-foreground">Breach Notification:</span> Be notified in the event of a data breach affecting their PHI</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact your healthcare provider or institution's privacy officer.
            </p>
          </div>
        </section>

        {/* 6. Cookies */}
        <section className="mb-12">
          <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
            6. Cookies and Tracking
          </h2>
          <div className="space-y-4 text-muted-foreground">
            <p>The System uses essential cookies and similar technologies for:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Session management and user authentication</li>
              <li>Security and fraud prevention</li>
              <li>System performance and error tracking</li>
              <li>User preference storage (display settings, language)</li>
            </ul>
            <p className="mt-4">
              We do not use third-party advertising or tracking cookies. You may configure your browser to refuse cookies, but this may limit system functionality.
            </p>
          </div>
        </section>

        {/* 7. Children's Privacy */}
        <section className="mb-12">
          <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
            7. Children's Privacy
          </h2>
          <p className="text-muted-foreground">
            The MCI Detection System is designed for use by healthcare professionals and authorized medical researchers. We do not knowingly collect personal information from individuals under 18 years of age. Patient MRI data may include minors, which is processed solely for diagnostic purposes under the supervision of licensed healthcare providers in compliance with applicable pediatric privacy laws.
          </p>
        </section>

        {/* 8. International Data Transfers */}
        <section className="mb-12">
          <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
            8. International Data Transfers
          </h2>
          <p className="text-muted-foreground">
            Patient data is stored and processed in secure data centers compliant with international data protection standards. Cross-border data transfers comply with GDPR (if applicable) and appropriate safeguards such as Standard Contractual Clauses.
          </p>
        </section>

        {/* 9. Updates to Policy */}
        <section className="mb-12">
          <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
            9. Changes to This Privacy Policy
          </h2>
          <p className="text-muted-foreground">
            We may update this Privacy Policy periodically to reflect changes in our practices, legal requirements, or system functionality. Material changes will be communicated to registered users via email or system notification. The "Last Updated" date at the top of this page indicates when the policy was last revised.
          </p>
        </section>

        {/* Contact */}
        <section>
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-6 w-6 text-accent" />
              <h2 className="font-heading font-bold text-2xl text-foreground">
                Contact Us
              </h2>
            </div>
            <p className="text-muted-foreground mb-4">
              For questions about this Privacy Policy, to exercise your privacy rights, or to report a privacy concern:
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-foreground">
                <span className="font-semibold">Email:</span>{" "}
                <a href="mailto:marealeigh@gmail.com" className="text-primary hover:underline">
                  marealeigh@gmail.com
                </a>
              </p>
              <p className="text-foreground">
                <span className="font-semibold">Phone:</span>{" "}
                <a href="tel:+639176398932" className="text-primary hover:underline">
                  +63 917 639 8932
                </a>
              </p>
              <p className="text-foreground">
                <span className="font-semibold">Address:</span> 1257-E Mataas Na Lupa St. Malate, Manila, Philippines
              </p>
            </div>
          </div>
        </section>

        {/* Back to Top */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
