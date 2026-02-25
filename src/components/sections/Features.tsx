"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  Brain,
  Scan,
  Eye,
  FileText,
  BarChart3,
  Shield,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRef } from "react";

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
    title: "ML-Powered Classification",
    description:
      "Advanced ML model extracts 26 hippocampal features to distinguish between Cognitively Normal (CN) and Mild Cognitive Impairment (MCI) with high accuracy.",
    gradient: "from-purple-500/10 to-pink-500/10",
    iconColor: "text-purple-600",
  },
  {
    icon: Eye,
    title: "Feature Importance Analysis",
    description:
      "Visual analysis shows which hippocampal features (volume, morphology, spatial patterns) most influence classification decisions, providing transparent ML explanations.",
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
      "Comprehensive clinical reports with classification results, probability scores, feature analysis, and volumetry data for documentation.",
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
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const moleculeY = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const moleculeRotate = useTransform(scrollYProgress, [0, 1], [0, 180]);

  return (
    <section ref={sectionRef} id="features" className="py-24 bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,119,198,0.12),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(74,222,128,0.12),transparent_50%)]" />

        {/* Molecular Structure SVG - Top Right with Parallax */}
        <motion.svg style={{ y: moleculeY, rotate: moleculeRotate }} className="absolute top-20 right-20 w-64 h-64 opacity-[0.06]" viewBox="0 0 200 200">
          <defs>
            <radialGradient id="moleculeGradient">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="rgb(37, 99, 235)" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Molecular bonds */}
          <line x1="100" y1="50" x2="150" y2="100" stroke="rgb(59, 130, 246)" strokeWidth="2" opacity="0.4" />
          <line x1="150" y1="100" x2="100" y2="150" stroke="rgb(59, 130, 246)" strokeWidth="2" opacity="0.4" />
          <line x1="100" y1="150" x2="50" y2="100" stroke="rgb(59, 130, 246)" strokeWidth="2" opacity="0.4" />
          <line x1="50" y1="100" x2="100" y2="50" stroke="rgb(59, 130, 246)" strokeWidth="2" opacity="0.4" />
          {/* Atoms */}
          <circle cx="100" cy="50" r="12" fill="rgb(59, 130, 246)" opacity="0.5" />
          <circle cx="150" cy="100" r="10" fill="rgb(96, 165, 250)" opacity="0.5" />
          <circle cx="100" cy="150" r="14" fill="rgb(37, 99, 235)" opacity="0.5" />
          <circle cx="50" cy="100" r="10" fill="rgb(96, 165, 250)" opacity="0.5" />
          <circle cx="100" cy="100" r="8" fill="rgb(147, 197, 253)" opacity="0.5" />
        </motion.svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Enhanced Reveal */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 15 }}
          >
            <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-foreground mb-4">
              Comprehensive ML-Powered Analysis
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              State-of-the-art machine learning technology combined with clinical
              expertise to deliver accurate, interpretable diagnostic support.
            </p>
          </motion.div>
        </div>

        {/* Balanced 2-Column Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  scale: 1.02,
                  rotateY: 5,
                  rotateX: 5,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                style={{ perspective: 1000 }}
              >
                <Card
                  className="group h-full border-2 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 bg-card/40 backdrop-blur-md relative overflow-hidden"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Glass morphism overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-background/60 via-background/40 to-transparent pointer-events-none" />
                  <CardContent className="p-8 md:p-10 relative z-10 text-center md:text-left flex flex-col items-center md:items-start">
                    {/* Icon with Enhanced Micro-interactions */}
                    <div className="mb-6">
                      <motion.div
                        whileHover={{
                          scale: 1.15,
                          rotate: [0, -10, 10, -10, 0],
                          transition: {
                            rotate: { duration: 0.5, ease: "easeInOut" },
                            scale: { duration: 0.2, ease: "easeOut" }
                          }
                        }}
                        className={`inline-flex p-5 rounded-xl bg-gradient-to-br ${feature.gradient} group-hover:shadow-lg transition-shadow relative overflow-hidden`}
                      >
                        {/* Ripple effect on hover */}
                        <motion.div
                          className="absolute inset-0 bg-white/20 rounded-xl"
                          initial={{ scale: 0, opacity: 0 }}
                          whileHover={{ scale: 2, opacity: [0, 0.3, 0] }}
                          transition={{ duration: 0.6 }}
                        />
                        <Icon
                          className={`h-9 w-9 ${feature.iconColor} relative z-10`}
                          strokeWidth={2}
                        />
                      </motion.div>
                    </div>

                    {/* Title */}
                    <h3 className="font-heading font-semibold text-2xl mb-3 text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed text-base">
                      {feature.description}
                    </p>

                    {/* Hover Indicator */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.4 + index * 0.15, ease: "easeOut" }}
                      className="h-1 bg-gradient-to-r from-primary to-accent mt-6 rounded-full origin-left"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
