"use client";

import { motion } from "framer-motion";
import { UserCog, Stethoscope, FlaskConical, Check } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const roles = [
  {
    icon: UserCog,
    title: "Admin / Radiologist",
    badge: "Full Access",
    description:
      "Complete system oversight with comprehensive diagnostic capabilities and administrative control.",
    gradient: "from-blue-600 to-cyan-600",
    bgGradient: "from-blue-500/10 to-cyan-500/10",
    capabilities: [
      "Patient MRI data management and analysis",
      "CNN model inference and result review",
      "Manual hippocampal tracing and slice selection",
      "PDF report generation and export",
      "User management and access control",
      "Analytics and comprehensive reporting",
    ],
  },
  {
    icon: Stethoscope,
    title: "Clinician / Neurologist",
    badge: "Clinical Review",
    description:
      "Focused interface for patient case review and clinical decision support with diagnostic insights.",
    gradient: "from-purple-600 to-pink-600",
    bgGradient: "from-purple-500/10 to-pink-500/10",
    capabilities: [
      "Patient case review and analysis results",
      "Classification results and probability scores",
      "Grad-CAM visualization review",
      "Hippocampal volumetry data access",
      "PDF report viewing and download",
      "Patient history and case management",
    ],
  },
  {
    icon: FlaskConical,
    title: "Researcher",
    badge: "Data Analytics",
    description:
      "Specialized tools for research analysis, dataset management, and model performance evaluation.",
    gradient: "from-emerald-600 to-teal-600",
    bgGradient: "from-emerald-500/10 to-teal-500/10",
    capabilities: [
      "Dataset management and batch processing",
      "Model performance analytics and metrics",
      "Export functionality for research data",
      "Aggregated analysis and statistics",
      "Research cohort management",
      "Advanced data visualization tools",
    ],
  },
];

export function UserRoles() {
  return (
    <section id="roles" className="py-24 bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-foreground mb-4">
              Tailored for Every User
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Three specialized interfaces designed for distinct clinical and
              research workflows with appropriate access levels and capabilities.
            </p>
          </motion.div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {roles.map((role, index) => {
            const Icon = role.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                <Card className="group h-full border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 bg-card/80 backdrop-blur-sm overflow-hidden">
                  {/* Gradient Header */}
                  <div
                    className={`h-2 bg-gradient-to-r ${role.gradient}`}
                  />

                  <CardHeader className="pb-4">
                    {/* Icon - Large and Prominent */}
                    <div className="mb-6 flex justify-center">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="relative"
                      >
                        {/* Glow effect */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-30 rounded-2xl blur-xl`} />

                        {/* Icon container */}
                        <div className={`relative inline-flex p-8 rounded-2xl bg-gradient-to-br ${role.bgGradient} border-2 border-opacity-20`} style={{ borderColor: role.gradient.split(' ')[1] }}>
                          <Icon
                            className="h-16 w-16"
                            strokeWidth={1.5}
                            style={{
                              stroke: `url(#gradient-${index})`,
                              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.1))",
                            }}
                          />
                          <svg width="0" height="0">
                            <defs>
                              <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={
                                  index === 0 ? "rgb(37, 99, 235)" :
                                  index === 1 ? "rgb(147, 51, 234)" :
                                  "rgb(16, 185, 129)"
                                } />
                                <stop offset="100%" stopColor={
                                  index === 0 ? "rgb(8, 145, 178)" :
                                  index === 1 ? "rgb(236, 72, 153)" :
                                  "rgb(20, 184, 166)"
                                } />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                      </motion.div>
                    </div>

                    {/* Badge */}
                    <div className="mb-3">
                      <Badge
                        variant="secondary"
                        className={`font-medium bg-gradient-to-r ${role.bgGradient} border-none`}
                      >
                        {role.badge}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h3 className="font-heading font-bold text-2xl text-foreground group-hover:text-primary transition-colors mb-3">
                      {role.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {role.description}
                    </p>
                  </CardHeader>

                  <CardContent>
                    {/* Capabilities List */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wide mb-4">
                        Key Capabilities
                      </p>
                      {role.capabilities.map((capability, capIndex) => (
                        <motion.div
                          key={capIndex}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.4,
                            delay: index * 0.15 + capIndex * 0.05,
                          }}
                          className="flex items-start gap-3"
                        >
                          <div
                            className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-gradient-to-br ${role.bgGradient} flex items-center justify-center`}
                          >
                            <Check className="h-3 w-3 text-foreground" strokeWidth={3} />
                          </div>
                          <p className="text-sm text-foreground/80 leading-relaxed">
                            {capability}
                          </p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Bottom Accent */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.15 + 0.5 }}
                      className={`h-1 bg-gradient-to-r ${role.gradient} mt-6 rounded-full origin-left`}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="inline-block bg-gradient-to-r from-accent/10 to-primary/10 rounded-2xl p-8 border border-border">
            <p className="text-lg font-heading font-semibold text-foreground mb-2">
              Need a Custom Role Configuration?
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              We can tailor access levels and capabilities to match your
              institution's specific workflows.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow"
            >
              Contact Us
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
