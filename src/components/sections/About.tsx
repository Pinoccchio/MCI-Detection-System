"use client";

import { motion } from "framer-motion";
import { Brain, Target, Shield, Award, TrendingUp, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  {
    icon: Target,
    value: "94.2%",
    label: "Classification Accuracy",
    description: "Validated on hippocampal MRI data",
    gradient: "from-blue-600 to-cyan-600",
    bgGradient: "from-blue-500/10 to-cyan-500/10",
  },
  {
    icon: TrendingUp,
    value: "89.7%",
    label: "Sensitivity Rate",
    description: "Early MCI detection capability",
    gradient: "from-purple-600 to-pink-600",
    bgGradient: "from-purple-500/10 to-pink-500/10",
  },
  {
    icon: Users,
    value: "3 Roles",
    label: "User Interfaces",
    description: "Tailored for clinical workflows",
    gradient: "from-emerald-600 to-teal-600",
    bgGradient: "from-emerald-500/10 to-teal-500/10",
  },
  {
    icon: Shield,
    value: "HIPAA",
    label: "Compliant Design",
    description: "Secure patient data handling",
    gradient: "from-amber-600 to-orange-600",
    bgGradient: "from-amber-500/10 to-orange-500/10",
  },
];

export function About() {
  return (
    <section id="about" className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 15 }}
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                <Brain className="h-6 w-6 text-primary" strokeWidth={2} />
              </div>
            </div>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-foreground mb-4">
              About MCI Detection System
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Advancing early Alzheimer's detection through AI-powered hippocampal analysis
            </p>
          </motion.div>
        </div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <Card className="border-2 border-primary/20 bg-card/60 backdrop-blur-sm">
            <CardContent className="p-8 md:p-10">
              <h3 className="font-heading font-bold text-2xl text-foreground mb-4">
                Our Mission
              </h3>
              <p className="text-muted-foreground leading-relaxed text-base mb-4">
                The MCI Detection System is a cutting-edge medical imaging platform designed to support early detection of Mild Cognitive Impairment (MCI) through advanced deep learning analysis of hippocampal structures in MRI scans.
              </p>
              <p className="text-muted-foreground leading-relaxed text-base">
                By leveraging a custom 2D Convolutional Neural Network trained on hippocampal-segmented masks, our system provides radiologists, clinicians, and researchers with powerful diagnostic insights, Grad-CAM visualizations, and volumetric analysis to aid in clinical decision-making and early intervention strategies.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                <Card className="h-full border-2 border-border/50 hover:border-primary/30 transition-all duration-300 bg-card/40 backdrop-blur-md">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4 flex justify-center">
                      <div className={`p-4 rounded-xl bg-gradient-to-br ${stat.bgGradient} border border-opacity-20`}>
                        <Icon className="h-8 w-8 text-primary" strokeWidth={2} />
                      </div>
                    </div>
                    <div className={`font-heading font-bold text-3xl bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                      {stat.value}
                    </div>
                    <h4 className="font-heading font-semibold text-sm text-foreground mb-1">
                      {stat.label}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Technology & Clinical Value */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Technology Overview */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
          >
            <Card className="h-full border-2 border-border/50 bg-card/40 backdrop-blur-md">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
                    <Brain className="h-6 w-6 text-accent" strokeWidth={2} />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-foreground">
                    Advanced Technology
                  </h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">Custom 2D CNN Architecture:</span> Specifically designed for hippocampal mask analysis
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">Grad-CAM Visualization:</span> Transparent AI explanations highlighting critical features
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">Volumetric Analysis:</span> Automated hippocampal volume estimation with atrophy indicators
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">DICOM Support:</span> Seamless integration with standard medical imaging workflows
                    </p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Clinical Value */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
          >
            <Card className="h-full border-2 border-border/50 bg-card/40 backdrop-blur-md">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                    <Award className="h-6 w-6 text-primary" strokeWidth={2} />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-foreground">
                    Clinical Value
                  </h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">Early Detection:</span> Identify MCI before significant cognitive decline occurs
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">Decision Support:</span> Augment clinical expertise with AI-powered insights
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">Standardized Analysis:</span> Consistent, reproducible results across patients
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">Research-Ready:</span> Comprehensive data export for ongoing studies
                    </p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12 max-w-3xl mx-auto"
        >
          <div className="inline-block bg-muted/50 rounded-xl p-6 border border-border">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Medical Disclaimer:</span> This system is designed as a clinical decision-support tool and does not replace professional medical diagnosis. All results should be interpreted by qualified healthcare professionals.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
