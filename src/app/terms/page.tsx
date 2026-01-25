import type { Metadata } from "next";
import Link from "next/link";
import { FileText, AlertTriangle, Scale, UserCheck, Lock, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | MCI Detection System",
  description: "Terms of service and user agreement for the MCI Detection System medical imaging platform.",
};

export default function TermsPage() {
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
              <FileText className="h-8 w-8 text-primary" strokeWidth={2} />
            </div>
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground">
              Terms of Service
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Please read these terms carefully before using the MCI Detection System.
            By accessing or using the System, you agree to be bound by these terms.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        {/* Medical Disclaimer - Prominent */}
        <section className="mb-12">
          <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="font-heading font-bold text-2xl text-foreground mb-3">
                  Important Medical Disclaimer
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  The MCI Detection System is a <span className="font-semibold text-foreground">clinical decision-support tool</span> designed to assist qualified healthcare professionals. It is <span className="font-semibold text-foreground">NOT</span> a replacement for professional medical diagnosis, treatment, or clinical judgment.
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>This system has <span className="font-semibold text-foreground">NOT</span> received FDA clearance or approval</li>
                  <li>All diagnostic decisions must be made by licensed healthcare professionals</li>
                  <li>Results should be interpreted alongside other clinical findings and patient history</li>
                  <li>The System's AI predictions are probabilistic and may contain errors</li>
                  <li>Never rely solely on AI output for patient treatment decisions</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 1. Acceptance of Terms */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <UserCheck className="h-6 w-6 text-primary" />
            <h2 className="font-heading font-bold text-2xl text-foreground">
              1. Acceptance of Terms
            </h2>
          </div>
          <div className="space-y-4 text-muted-foreground">
            <p>
              By creating an account, accessing, or using the MCI Detection System ("System", "Service"), you ("User", "you") agree to comply with and be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not access or use the System.
            </p>
            <p>
              These Terms constitute a legally binding agreement between you and the MCI Detection System operators regarding your use of the Service.
            </p>
          </div>
        </section>

        {/* 2. User Eligibility */}
        <section className="mb-12">
          <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
            2. User Eligibility and Authorization
          </h2>
          <div className="space-y-4 text-muted-foreground">
            <p>The System is intended for use only by:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><span className="font-semibold text-foreground">Licensed Healthcare Professionals:</span> Radiologists, neurologists, clinicians, and other medical professionals authorized to interpret medical imaging</li>
              <li><span className="font-semibold text-foreground">Medical Researchers:</span> Qualified individuals engaged in legitimate Alzheimer's or MCI research</li>
              <li><span className="font-semibold text-foreground">Authorized Administrators:</span> IT personnel and system administrators at approved healthcare institutions</li>
            </ul>
            <p className="mt-4">
              You represent and warrant that:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>You are at least 18 years of age</li>
              <li>You have the legal authority to access and use protected health information (PHI)</li>
              <li>All information provided during registration is accurate and complete</li>
              <li>You will maintain the accuracy of your account information</li>
              <li>You are authorized by your institution to use this System</li>
            </ul>
          </div>
        </section>

        {/* 3. User Roles and Access */}
        <section className="mb-12">
          <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
            3. User Roles and Access Control
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                3.1 Role-Based Access
              </h3>
              <p className="text-muted-foreground mb-3">
                The System provides three distinct user roles with varying access levels:
              </p>
              <div className="space-y-3">
                <div className="border-l-2 border-primary pl-4">
                  <p className="font-semibold text-foreground">Admin / Radiologist (Full Access)</p>
                  <p className="text-sm text-muted-foreground">Complete system oversight, MRI data management, CNN analysis, manual tracing, PDF generation, user management, and comprehensive reporting.</p>
                </div>
                <div className="border-l-2 border-accent pl-4">
                  <p className="font-semibold text-foreground">Clinician / Neurologist (Clinical Review)</p>
                  <p className="text-sm text-muted-foreground">Patient case review, classification results viewing, Grad-CAM visualization, volumetry data access, and PDF report download.</p>
                </div>
                <div className="border-l-2 border-secondary pl-4">
                  <p className="font-semibold text-foreground">Researcher (Data Analytics)</p>
                  <p className="text-sm text-muted-foreground">Dataset management, batch processing, model analytics, data export, and aggregated statistics.</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                3.2 Access Restrictions
              </h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>You may only access data and features appropriate to your assigned role</li>
                <li>Unauthorized attempts to access restricted areas will result in account suspension</li>
                <li>User credentials are non-transferable and must not be shared</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. Acceptable Use */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Scale className="h-6 w-6 text-primary" />
            <h2 className="font-heading font-bold text-2xl text-foreground">
              4. Acceptable Use Policy
            </h2>
          </div>
          <div className="space-y-4 text-muted-foreground">
            <p className="font-semibold text-foreground">You agree to use the System only for legitimate medical or research purposes. Prohibited activities include:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Using the System for non-medical or fraudulent purposes</li>
              <li>Uploading MRI data without proper patient consent or authorization</li>
              <li>Attempting to reverse-engineer, decompile, or extract the CNN model</li>
              <li>Sharing patient data with unauthorized third parties</li>
              <li>Circumventing security measures or authentication controls</li>
              <li>Introducing viruses, malware, or other harmful code</li>
              <li>Excessive or automated querying that burdens system resources</li>
              <li>Using the System to train competing AI models without authorization</li>
              <li>Violating HIPAA, GDPR, or other applicable data protection laws</li>
              <li>Misrepresenting AI-generated results as definitive diagnoses</li>
            </ul>
          </div>
        </section>

        {/* 5. Intellectual Property */}
        <section className="mb-12">
          <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
            5. Intellectual Property Rights
          </h2>
          <div className="space-y-4 text-muted-foreground">
            <div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                5.1 System Ownership
              </h3>
              <p>
                All rights, title, and interest in the MCI Detection System, including but not limited to the 2D CNN model architecture, trained weights, algorithms, software code, user interface, documentation, and trademarks, are owned by the System operators and protected by intellectual property laws.
              </p>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                5.2 User Data
              </h3>
              <p>
                You retain all rights to the MRI data and patient information you upload. By using the System, you grant us a limited, non-exclusive license to process this data solely for the purpose of providing the Service (CNN analysis, visualization, reporting).
              </p>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                5.3 Research Use
              </h3>
              <p>
                With your explicit consent, de-identified data may be used to improve the CNN model or for research purposes. You may opt out of research data sharing at any time through your account settings.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Limitation of Liability */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <h2 className="font-heading font-bold text-2xl text-foreground">
              6. Limitation of Liability
            </h2>
          </div>
          <div className="space-y-4 text-muted-foreground">
            <p className="font-semibold text-foreground uppercase">
              Important: Please read this section carefully
            </p>
            <p>
              TO THE FULLEST EXTENT PERMITTED BY LAW, THE MCI DETECTION SYSTEM AND ITS OPERATORS SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Incorrect or inaccurate AI predictions or classifications</li>
              <li>Medical decisions made based on System output</li>
              <li>Patient harm resulting from reliance on AI-generated results</li>
              <li>Data loss, corruption, or unauthorized access despite security measures</li>
              <li>System downtime, interruptions, or technical malfunctions</li>
              <li>Consequential, indirect, incidental, or punitive damages</li>
              <li>Loss of revenue, profits, data, or business opportunities</li>
            </ul>
            <p className="mt-4">
              The System is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
            </p>
            <p>
              <span className="font-semibold text-foreground">MAXIMUM LIABILITY:</span> In no event shall our total liability exceed the fees paid by you (if any) for use of the System in the 12 months preceding the claim.
            </p>
          </div>
        </section>

        {/* 7. Data Security */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="h-6 w-6 text-accent" />
            <h2 className="font-heading font-bold text-2xl text-foreground">
              7. Data Security and User Responsibilities
            </h2>
          </div>
          <div className="space-y-4 text-muted-foreground">
            <p>While we implement industry-standard security measures, you are responsible for:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Maintaining the confidentiality of your login credentials</li>
              <li>Using strong, unique passwords and enabling multi-factor authentication</li>
              <li>Logging out of shared or public computers</li>
              <li>Promptly reporting any suspected security breaches or unauthorized access</li>
              <li>Ensuring uploaded MRI data complies with patient consent requirements</li>
              <li>Complying with your institution's IT and security policies</li>
            </ul>
          </div>
        </section>

        {/* 8. Privacy and HIPAA */}
        <section className="mb-12">
          <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
            8. Privacy and HIPAA Compliance
          </h2>
          <p className="text-muted-foreground">
            Your use of the System is also governed by our{" "}
            <Link href="/privacy" className="text-primary hover:underline font-semibold">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/hipaa" className="text-primary hover:underline font-semibold">
              HIPAA Compliance
            </Link>{" "}
            documentation. We are committed to protecting patient privacy and maintaining compliance with applicable healthcare data protection regulations.
          </p>
        </section>

        {/* 9. Term and Termination */}
        <section className="mb-12">
          <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
            9. Term and Termination
          </h2>
          <div className="space-y-4 text-muted-foreground">
            <div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                9.1 Term
              </h3>
              <p>
                These Terms remain in effect for as long as you have an active account and use the System.
              </p>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                9.2 Termination by You
              </h3>
              <p>
                You may terminate your account at any time by contacting us. Upon termination, your access will be revoked and your data will be handled according to our Privacy Policy.
              </p>
            </div>
            <div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                9.3 Termination by Us
              </h3>
              <p>
                We reserve the right to suspend or terminate your account immediately, without notice, if you:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Violate these Terms</li>
                <li>Engage in fraudulent or illegal activity</li>
                <li>Compromise system security</li>
                <li>Fail to pay applicable fees (if any)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 10. Changes to Terms */}
        <section className="mb-12">
          <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
            10. Modifications to Terms
          </h2>
          <p className="text-muted-foreground">
            We may update these Terms periodically. Material changes will be communicated via email or system notification. Continued use of the System after changes constitutes acceptance of the updated Terms. We recommend reviewing these Terms regularly.
          </p>
        </section>

        {/* 11. Governing Law */}
        <section className="mb-12">
          <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
            11. Governing Law and Dispute Resolution
          </h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Republic of the Philippines, without regard to its conflict of law provisions.
            </p>
            <p>
              Any disputes arising from or relating to these Terms or the System shall be resolved through good faith negotiation. If negotiation fails, disputes shall be subject to the exclusive jurisdiction of the courts of Metro Manila, Philippines.
            </p>
          </div>
        </section>

        {/* 12. Severability */}
        <section className="mb-12">
          <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
            12. Severability
          </h2>
          <p className="text-muted-foreground">
            If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable.
          </p>
        </section>

        {/* Contact */}
        <section>
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-6 w-6 text-accent" />
              <h2 className="font-heading font-bold text-2xl text-foreground">
                Questions About These Terms?
              </h2>
            </div>
            <p className="text-muted-foreground mb-4">
              If you have questions about these Terms of Service or need clarification on any provision, please contact us:
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
