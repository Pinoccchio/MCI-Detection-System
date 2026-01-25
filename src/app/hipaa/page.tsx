import type { Metadata } from "next";
import Link from "next/link";
import { Shield, CheckCircle, Lock, FileText, AlertCircle, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "HIPAA Compliance | MCI Detection System",
  description: "HIPAA compliance information and protected health information safeguards for the MCI Detection System.",
};

export default function HIPAAPage() {
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
              HIPAA Compliance
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            The MCI Detection System is designed with HIPAA (Health Insurance Portability
            and Accountability Act) compliance at its core to protect patient privacy and
            secure protected health information.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        {/* Overview */}
        <section className="mb-12">
          <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-6">
            <h2 className="font-heading font-bold text-2xl text-foreground mb-3">
              Our Commitment to HIPAA Compliance
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The MCI Detection System handles protected health information (PHI) including MRI scans, hippocampal analysis data, and patient diagnostic results. We implement comprehensive administrative, physical, and technical safeguards as required by HIPAA Privacy and Security Rules to ensure the confidentiality, integrity, and availability of all PHI.
            </p>
          </div>
        </section>

        {/* HIPAA Safeguards */}
        <section className="mb-12">
          <h2 className="font-heading font-bold text-3xl text-foreground mb-6">
            HIPAA Safeguard Implementation
          </h2>

          {/* Administrative Safeguards */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-6 w-6 text-primary" />
              <h3 className="font-heading font-semibold text-xl text-foreground">
                Administrative Safeguards
              </h3>
            </div>
            <div className="grid gap-4">
              <div className="border-l-2 border-primary/30 pl-4">
                <h4 className="font-semibold text-foreground mb-2">Security Management Process</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Regular risk assessments and security audits</li>
                  <li>Risk management and mitigation strategies</li>
                  <li>Sanction policies for HIPAA violations</li>
                  <li>Information system activity review and monitoring</li>
                </ul>
              </div>
              <div className="border-l-2 border-primary/30 pl-4">
                <h4 className="font-semibold text-foreground mb-2">Workforce Security</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Authorization and supervision of personnel accessing PHI</li>
                  <li>Clearance procedures for workforce members</li>
                  <li>Termination procedures for revoking access</li>
                  <li>HIPAA training and awareness programs</li>
                </ul>
              </div>
              <div className="border-l-2 border-primary/30 pl-4">
                <h4 className="font-semibold text-foreground mb-2">Access Management</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Role-based access control (Admin, Clinician, Researcher)</li>
                  <li>Unique user identification and authentication</li>
                  <li>Emergency access procedures</li>
                  <li>Automatic logoff after inactivity</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Physical Safeguards */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-6 w-6 text-accent" />
              <h3 className="font-heading font-semibold text-xl text-foreground">
                Physical Safeguards
              </h3>
            </div>
            <div className="grid gap-4">
              <div className="border-l-2 border-accent/30 pl-4">
                <h4 className="font-semibold text-foreground mb-2">Facility Access Controls</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Secure data centers with restricted physical access</li>
                  <li>24/7 surveillance and monitoring systems</li>
                  <li>Visitor logs and escort requirements</li>
                  <li>Environmental controls (fire suppression, climate control)</li>
                </ul>
              </div>
              <div className="border-l-2 border-accent/30 pl-4">
                <h4 className="font-semibold text-foreground mb-2">Workstation Security</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Secure workstation configurations</li>
                  <li>Screen privacy filters where applicable</li>
                  <li>Automatic screen lock policies</li>
                  <li>Restrictions on removable media</li>
                </ul>
              </div>
              <div className="border-l-2 border-accent/30 pl-4">
                <h4 className="font-semibold text-foreground mb-2">Device and Media Controls</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Secure disposal of hardware containing PHI</li>
                  <li>Media reuse procedures with data sanitization</li>
                  <li>Accountability for hardware movement</li>
                  <li>Backup and recovery procedures</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Technical Safeguards */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <h3 className="font-heading font-semibold text-xl text-foreground">
                Technical Safeguards
              </h3>
            </div>
            <div className="grid gap-4">
              <div className="border-l-2 border-primary/30 pl-4">
                <h4 className="font-semibold text-foreground mb-2">Access Control</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Unique user identification (email-based authentication)</li>
                  <li>Emergency access procedures with audit trails</li>
                  <li>Automatic logoff after 30 minutes of inactivity</li>
                  <li>Encryption of login credentials</li>
                </ul>
              </div>
              <div className="border-l-2 border-primary/30 pl-4">
                <h4 className="font-semibold text-foreground mb-2">Audit Controls</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Comprehensive logging of PHI access and modifications</li>
                  <li>Regular review of system activity logs</li>
                  <li>Tamper-resistant audit trails</li>
                  <li>Monitoring for unauthorized access attempts</li>
                </ul>
              </div>
              <div className="border-l-2 border-primary/30 pl-4">
                <h4 className="font-semibold text-foreground mb-2">Integrity Controls</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Data validation and integrity checks</li>
                  <li>Protection against unauthorized modification or destruction</li>
                  <li>Checksums and hash verification for MRI files</li>
                  <li>Version control and change tracking</li>
                </ul>
              </div>
              <div className="border-l-2 border-primary/30 pl-4">
                <h4 className="font-semibold text-foreground mb-2">Transmission Security</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>TLS 1.3 encryption for all data in transit</li>
                  <li>AES-256 encryption for data at rest</li>
                  <li>Secure API endpoints with authentication tokens</li>
                  <li>End-to-end encryption for sensitive communications</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Business Associate Agreements */}
        <section className="mb-12">
          <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
            Business Associate Agreements (BAA)
          </h2>
          <p className="text-muted-foreground mb-4">
            The MCI Detection System enters into Business Associate Agreements with all third-party service providers who have access to PHI, including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Cloud hosting providers (database and file storage)</li>
            <li>Backup and disaster recovery services</li>
            <li>Security monitoring and incident response vendors</li>
            <li>Analytics platforms (only if PHI is accessed)</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            All Business Associates are contractually obligated to comply with HIPAA requirements and protect PHI according to the same standards we maintain.
          </p>
        </section>

        {/* Patient Rights */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="h-6 w-6 text-accent" />
            <h2 className="font-heading font-bold text-2xl text-foreground">
              Patient Rights Under HIPAA
            </h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Patients whose medical imaging data is processed by the System have the following rights:
          </p>
          <div className="grid gap-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">Right to Access</h4>
              <p className="text-sm text-muted-foreground">Request and receive copies of their MRI scans, analysis results, and all PHI maintained by the System.</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">Right to Amendment</h4>
              <p className="text-sm text-muted-foreground">Request corrections to inaccurate or incomplete PHI (subject to healthcare provider approval).</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">Right to Accounting of Disclosures</h4>
              <p className="text-sm text-muted-foreground">Receive a list of instances where their PHI was disclosed to third parties.</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">Right to Request Restrictions</h4>
              <p className="text-sm text-muted-foreground">Request limits on how their PHI is used or disclosed (subject to feasibility).</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">Right to Confidential Communications</h4>
              <p className="text-sm text-muted-foreground">Request communications about their PHI through specific methods or locations.</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">Right to Breach Notification</h4>
              <p className="text-sm text-muted-foreground">Be notified within 60 days if their unsecured PHI is breached.</p>
            </div>
          </div>
        </section>

        {/* Breach Notification */}
        <section className="mb-12">
          <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="font-heading font-bold text-2xl text-foreground mb-3">
                  Breach Notification Procedures
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  In the event of a breach of unsecured PHI, we will:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Notify affected individuals without unreasonable delay (within 60 days)</li>
                  <li>Provide description of the breach and types of information involved</li>
                  <li>Describe steps individuals should take to protect themselves</li>
                  <li>Outline our investigation and mitigation efforts</li>
                  <li>Provide contact information for further inquiries</li>
                  <li>Notify the Secretary of HHS as required</li>
                  <li>Notify media outlets if breach affects 500+ individuals in a jurisdiction</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance Monitoring */}
        <section className="mb-12">
          <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
            Ongoing Compliance and Monitoring
          </h2>
          <p className="text-muted-foreground mb-4">
            We maintain HIPAA compliance through:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Annual HIPAA compliance audits by third-party assessors</li>
            <li>Quarterly internal security assessments</li>
            <li>Continuous monitoring of access logs and system activity</li>
            <li>Regular staff training and awareness programs</li>
            <li>Updates to policies and procedures as regulations evolve</li>
            <li>Incident response drills and tabletop exercises</li>
          </ul>
        </section>

        {/* Contact */}
        <section>
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-6 w-6 text-accent" />
              <h2 className="font-heading font-bold text-2xl text-foreground">
                HIPAA Compliance Questions
              </h2>
            </div>
            <p className="text-muted-foreground mb-4">
              For questions about HIPAA compliance, to exercise patient rights, or to report a privacy concern:
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-foreground">
                <span className="font-semibold">Privacy Officer Email:</span>{" "}
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
