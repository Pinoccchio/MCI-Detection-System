import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Shield, Server, Key, Eye, AlertTriangle, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Data Security | MCI Detection System",
  description: "Comprehensive security measures and protocols protecting patient medical imaging data in the MCI Detection System.",
};

export default function SecurityPage() {
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
              <Lock className="h-8 w-8 text-primary" strokeWidth={2} />
            </div>
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground">
              Data Security
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Security is paramount when handling sensitive medical imaging data. Our
            comprehensive security framework protects patient MRI scans and diagnostic
            results at every layer.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        {/* Security Overview */}
        <section className="mb-12">
          <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-6">
            <h2 className="font-heading font-bold text-2xl text-foreground mb-3">
              Multi-Layered Security Architecture
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The MCI Detection System employs defense-in-depth security principles, implementing multiple layers of protection to safeguard protected health information (PHI) and maintain the confidentiality, integrity, and availability of all medical data.
            </p>
          </div>
        </section>

        {/* Encryption */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="h-6 w-6 text-primary" />
            <h2 className="font-heading font-bold text-2xl text-foreground">
              Encryption Standards
            </h2>
          </div>

          <div className="space-y-6">
            <div className="border border-border rounded-xl p-6 bg-card/40">
              <h3 className="font-heading font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Data in Transit
              </h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><span className="font-semibold text-foreground">TLS 1.3:</span> All communications between client and server encrypted with latest TLS protocol</li>
                <li><span className="font-semibold text-foreground">Perfect Forward Secrecy:</span> Unique session keys prevent compromise of past communications</li>
                <li><span className="font-semibold text-foreground">Certificate Pinning:</span> Protection against man-in-the-middle attacks</li>
                <li><span className="font-semibold text-foreground">Secure WebSockets:</span> Real-time data transmission over encrypted channels</li>
              </ul>
            </div>

            <div className="border border-border rounded-xl p-6 bg-card/40">
              <h3 className="font-heading font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                Data at Rest
              </h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><span className="font-semibold text-foreground">AES-256 Encryption:</span> Military-grade encryption for all stored MRI files and patient data</li>
                <li><span className="font-semibold text-foreground">Database Encryption:</span> Transparent data encryption (TDE) for database records</li>
                <li><span className="font-semibold text-foreground">Encrypted Backups:</span> All backup files encrypted before storage</li>
                <li><span className="font-semibold text-foreground">Key Management:</span> Secure key rotation and storage using industry-standard vaults</li>
              </ul>
            </div>

            <div className="border border-border rounded-xl p-6 bg-card/40">
              <h3 className="font-heading font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                Password Protection
              </h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><span className="font-semibold text-foreground">Bcrypt Hashing:</span> One-way password hashing with adaptive cost factor</li>
                <li><span className="font-semibold text-foreground">Salt per User:</span> Unique cryptographic salt for each password</li>
                <li><span className="font-semibold text-foreground">Minimum Requirements:</span> 8+ characters with complexity requirements</li>
                <li><span className="font-semibold text-foreground">MFA Support:</span> Multi-factor authentication available for enhanced security</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Access Control */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Key className="h-6 w-6 text-accent" />
            <h2 className="font-heading font-bold text-2xl text-foreground">
              Access Control & Authentication
            </h2>
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg p-5">
                <h4 className="font-semibold text-foreground mb-2">Role-Based Access Control (RBAC)</h4>
                <p className="text-sm text-muted-foreground">Users only access data necessary for their role: Admin/Radiologist, Clinician/Neurologist, or Researcher.</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h4 className="font-semibold text-foreground mb-2">Principle of Least Privilege</h4>
                <p className="text-sm text-muted-foreground">Minimum access rights required to perform job functions, reducing attack surface.</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h4 className="font-semibold text-foreground mb-2">Session Management</h4>
                <p className="text-sm text-muted-foreground">Automatic timeout after 30 minutes of inactivity, secure session tokens, logout on all devices.</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h4 className="font-semibold text-foreground mb-2">Access Logging</h4>
                <p className="text-sm text-muted-foreground">All PHI access is logged with user ID, timestamp, action type, and IP address for audit trails.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Infrastructure Security */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Server className="h-6 w-6 text-primary" />
            <h2 className="font-heading font-bold text-2xl text-foreground">
              Infrastructure & Network Security
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-3">
                Secure Hosting Environment
              </h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Enterprise-grade cloud infrastructure with HIPAA compliance certifications</li>
                <li>Geographically distributed data centers with redundancy</li>
                <li>DDoS protection and traffic filtering at network edge</li>
                <li>Isolated network segments (VPC) for database and application tiers</li>
                <li>Regular security patches and OS updates</li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-3">
                Firewall & Intrusion Detection
              </h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Web Application Firewall (WAF) blocking malicious requests</li>
                <li>Intrusion Detection System (IDS) monitoring suspicious activity</li>
                <li>Rate limiting and brute-force protection</li>
                <li>IP whitelisting available for institutional access</li>
                <li>Real-time threat intelligence integration</li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-3">
                API Security
              </h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>OAuth 2.0 and JWT token-based authentication</li>
                <li>API rate limiting to prevent abuse</li>
                <li>Input validation and sanitization against injection attacks</li>
                <li>CORS policies restricting unauthorized origins</li>
                <li>API versioning and deprecation policies</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Monitoring & Incident Response */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Eye className="h-6 w-6 text-accent" />
            <h2 className="font-heading font-bold text-2xl text-foreground">
              Security Monitoring & Incident Response
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-3">
                24/7 Security Monitoring
              </h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Continuous monitoring of system logs and access patterns</li>
                <li>Automated alerts for suspicious activity (failed logins, privilege escalation attempts)</li>
                <li>Real-time anomaly detection using machine learning</li>
                <li>Security Information and Event Management (SIEM) integration</li>
                <li>Regular vulnerability scans and penetration testing</li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-3">
                Incident Response Plan
              </h3>
              <p className="text-muted-foreground mb-3">
                In the event of a security incident, our response protocol includes:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li><span className="font-semibold text-foreground">Detection:</span> Automated alerts trigger immediate investigation</li>
                <li><span className="font-semibold text-foreground">Containment:</span> Isolate affected systems to prevent spread</li>
                <li><span className="font-semibold text-foreground">Eradication:</span> Remove threat and close vulnerabilities</li>
                <li><span className="font-semibold text-foreground">Recovery:</span> Restore services from secure backups</li>
                <li><span className="font-semibold text-foreground">Notification:</span> Inform affected users and authorities per HIPAA requirements</li>
                <li><span className="font-semibold text-foreground">Post-Incident Review:</span> Analyze root cause and improve defenses</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Compliance & Auditing */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="font-heading font-bold text-2xl text-foreground">
              Compliance & Third-Party Audits
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-l-4 border-primary/30 pl-4">
              <h4 className="font-semibold text-foreground mb-2">Regular Security Audits</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Annual third-party security assessments</li>
                <li>Quarterly internal penetration tests</li>
                <li>Code security reviews before deployment</li>
                <li>Dependency vulnerability scanning</li>
              </ul>
            </div>
            <div className="border-l-4 border-accent/30 pl-4">
              <h4 className="font-semibold text-foreground mb-2">Compliance Standards</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>HIPAA Security Rule compliance</li>
                <li>GDPR data protection practices</li>
                <li>OWASP Top 10 mitigation</li>
                <li>ISO 27001 framework alignment</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Vulnerability Disclosure */}
        <section className="mb-12">
          <div className="bg-amber-500/10 border-l-4 border-amber-500 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="font-heading font-bold text-2xl text-foreground mb-3">
                  Responsible Vulnerability Disclosure
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  We welcome reports from security researchers who discover vulnerabilities. If you find a security issue:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Email details to <a href="mailto:marealeigh@gmail.com" className="text-primary hover:underline font-semibold">marealeigh@gmail.com</a> with "Security Vulnerability" in subject</li>
                  <li>Include steps to reproduce, affected components, and potential impact</li>
                  <li>Allow us reasonable time to address the issue before public disclosure</li>
                  <li>Do not access or modify patient data during testing</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-3">
                  We commit to acknowledging reports within 48 hours and providing updates on remediation progress.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section>
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-6 w-6 text-accent" />
              <h2 className="font-heading font-bold text-2xl text-foreground">
                Security Questions or Concerns
              </h2>
            </div>
            <p className="text-muted-foreground mb-4">
              For security-related questions, vulnerability reports, or incident notifications:
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-foreground">
                <span className="font-semibold">Security Email:</span>{" "}
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
