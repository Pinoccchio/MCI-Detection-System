"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Scan,
  Eye,
  FileText,
  BarChart3,
  Shield,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Scan,
    title: "Hippocampal Segmentation",
    description:
      "Precise analysis of hippocampal-segmented masks from MRI scans with advanced preprocessing and binary mask conversion for optimal model performance.",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-600",
  },
  {
    icon: Brain,
    title: "CNN-Powered Classification",
    description:
      "Custom 2D Convolutional Neural Network trained to distinguish between Cognitively Normal (CN) and Mild Cognitive Impairment (MCI) with exceptional accuracy.",
    gradient: "from-purple-500/10 to-pink-500/10",
    iconColor: "text-purple-600",
  },
  {
    icon: Eye,
    title: "Grad-CAM Visualization",
    description:
      "Interactive heatmap overlays highlight critical hippocampal features that influence classification decisions, providing transparent AI explanations.",
    gradient: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-600",
  },
  {
    icon: BarChart3,
    title: "Volumetry Estimation",
    description:
      "Automated pixel-based hippocampal volume calculations with atrophy indicators to support comprehensive neurological assessment.",
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconColor: "text-emerald-600",
  },
  {
    icon: FileText,
    title: "PDF Report Generation",
    description:
      "Comprehensive clinical reports with classification results, probability scores, Grad-CAM visualizations, and volumetry data for documentation.",
    gradient: "from-rose-500/10 to-red-500/10",
    iconColor: "text-rose-600",
  },
  {
    icon: Shield,
    title: "Role-Based Access Control",
    description:
      "Secure multi-user system with distinct interfaces for Admin/Radiologists, Clinicians/Neurologists, and Researchers with appropriate permissions.",
    gradient: "from-indigo-500/10 to-blue-500/10",
    iconColor: "text-indigo-600",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export function Features() {
  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,119,198,0.05),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(74,222,128,0.05),transparent_50%)]" />

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
              Comprehensive AI-Powered Analysis
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              State-of-the-art deep learning technology combined with clinical
              expertise to deliver accurate, interpretable diagnostic support.
            </p>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card
                  className="group h-full border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 bg-card/50 backdrop-blur-sm"
                >
                  <CardContent className="p-6 md:p-8">
                    {/* Icon */}
                    <div className="mb-5">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.gradient} group-hover:shadow-lg transition-shadow`}
                      >
                        <Icon
                          className={`h-7 w-7 ${feature.iconColor}`}
                          strokeWidth={2}
                        />
                      </motion.div>
                    </div>

                    {/* Title */}
                    <h3 className="font-heading font-semibold text-xl mb-3 text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {feature.description}
                    </p>

                    {/* Hover Indicator */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                      className="h-1 bg-gradient-to-r from-primary to-accent mt-5 rounded-full origin-left"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">
            Ready to experience the future of neuroimaging diagnostics?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow"
          >
            Schedule a Demo
            <span className="text-lg">→</span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
