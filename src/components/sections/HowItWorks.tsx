"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Upload, Pen, Cpu, Eye, FileCheck } from "lucide-react";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload MRI Scans",
    description:
      "Import NIfTI format hippocampal masks directly into the system. Our platform supports batch uploads and automatic file validation for seamless integration.",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
  },
  {
    number: "02",
    icon: Pen,
    title: "Manual Hippocampal Tracing",
    description:
      "Use our interactive slice viewer to select relevant MRI slices and perform precise manual hippocampal region tracing with intuitive drawing tools.",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
  },
  {
    number: "03",
    icon: Cpu,
    title: "Automated ML Analysis",
    description:
      "Our ML model extracts 26 features from hippocampal masks including volumetry, morphology, and spatial patterns to generate classification predictions.",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10",
  },
  {
    number: "04",
    icon: Eye,
    title: "Review Analysis Results",
    description:
      "Examine detailed classification results with probability scores and feature importance analysis highlighting critical diagnostic factors.",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    number: "05",
    icon: FileCheck,
    title: "Generate Comprehensive Reports",
    description:
      "Export professional PDF reports containing all analysis results, visualizations, volumetry data, and clinical recommendations for patient records.",
    color: "from-rose-500 to-red-500",
    bgColor: "bg-rose-500/10",
  },
];

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="py-24 bg-gradient-to-b from-accent/10 via-background to-background relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Subtle gradient orbs */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/12 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

        {/* Medical Cross Pattern - Bottom Left */}
        <svg className="absolute bottom-40 left-40 w-48 h-48 opacity-[0.05]" viewBox="0 0 100 100">
          <rect x="40" y="20" width="20" height="60" fill="rgb(245, 158, 11)" />
          <rect x="20" y="40" width="60" height="20" fill="rgb(245, 158, 11)" />
        </svg>
      </div>

      <motion.div
        style={{ opacity }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        {/* Section Header with Enhanced Reveal */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 15 }}
          >
            <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A streamlined five-step process from MRI upload to clinical
              reporting, designed for efficiency and accuracy.
            </p>
          </motion.div>
        </div>

        {/* Steps Timeline */}
        <div className="relative max-w-6xl mx-auto">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-accent/30 to-primary/20 -translate-x-1/2" />

          {/* Steps */}
          <div className="space-y-16 lg:space-y-24">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: index * 0.15, type: "spring", stiffness: 80 }}
                  className={`relative grid lg:grid-cols-2 gap-8 items-center ${
                    isEven ? "" : "lg:direction-rtl"
                  }`}
                >
                  {/* Content */}
                  <div
                    className={`text-center lg:text-left flex flex-col items-center lg:items-start ${
                      isEven ? "lg:text-right lg:pr-16 lg:items-end" : "lg:pl-16 lg:col-start-2"
                    }`}
                  >
                    <div className="inline-block mb-4">
                      <span
                        className={`font-heading font-bold text-6xl bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}
                      >
                        {step.number}
                      </span>
                    </div>

                    <h3 className="font-heading font-semibold text-2xl md:text-3xl text-foreground mb-4">
                      {step.title}
                    </h3>

                    <p className="text-muted-foreground leading-relaxed text-base max-w-md">
                      {step.description}
                    </p>
                  </div>

                  {/* Visual Element */}
                  <div
                    className={`relative ${
                      isEven ? "lg:pl-16" : "lg:pr-16 lg:col-start-1 lg:row-start-1"
                    }`}
                  >
                    <motion.div
                      whileHover={{
                        scale: 1.05,
                        rotateY: isEven ? 5 : -5,
                        rotateX: 3,
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="relative"
                      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
                    >
                      {/* Glow Effect */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-20 rounded-2xl blur-2xl`}
                      />

                      {/* Card with Glass Morphism */}
                      <div className="relative bg-card/40 backdrop-blur-md border-2 border-border/50 rounded-2xl shadow-xl overflow-hidden min-h-[280px]">
                        {/* Glass morphism overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-background/60 via-background/40 to-transparent pointer-events-none" />

                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-[0.03]">
                          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />
                        </div>

                        {/* Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${step.bgColor} opacity-40`} />

                        {/* Content Container */}
                        <div className="relative p-8 md:p-10 flex flex-col items-center justify-center h-full">
                          {/* Step-specific visual content */}
                          {index === 0 && (
                            // Upload MRI - File Upload Interface
                            <div className="w-full space-y-6">
                              <div className="flex justify-center">
                                <div className={`p-6 rounded-2xl bg-gradient-to-br ${step.bgColor} border-2 border-dashed`} style={{ borderColor: 'rgb(59, 130, 246)' }}>
                                  <Upload className="h-20 w-20 text-blue-500" strokeWidth={1.5} />
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3 bg-background/60 backdrop-blur-sm rounded-lg p-3">
                                  <div className="h-10 w-10 rounded bg-blue-500/20 flex items-center justify-center">
                                    <span className="text-xs font-mono text-blue-600">NII</span>
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <div className="h-2 w-32 bg-blue-500/30 rounded" />
                                    <div className="h-2 w-20 bg-blue-500/20 rounded" />
                                  </div>
                                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                </div>
                                <div className="flex items-center gap-3 bg-background/40 backdrop-blur-sm rounded-lg p-3 opacity-60">
                                  <div className="h-10 w-10 rounded bg-blue-500/10 flex items-center justify-center">
                                    <span className="text-xs font-mono text-blue-600">NII</span>
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <div className="h-2 w-28 bg-blue-500/20 rounded" />
                                    <div className="h-2 w-16 bg-blue-500/10 rounded" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {index === 1 && (
                            // Manual Tracing - Brain with Drawing Path
                            <div className="w-full space-y-4">
                              <div className="relative w-40 h-40 mx-auto">
                                {/* Brain outline */}
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30" />
                                {/* Hippocampus region */}
                                <motion.svg
                                  className="absolute inset-0 w-full h-full"
                                  viewBox="0 0 160 160"
                                  initial={{ opacity: 0 }}
                                  whileInView={{ opacity: 1 }}
                                  viewport={{ once: true }}
                                >
                                  <motion.path
                                    d="M 60,80 Q 70,60 90,70 Q 100,75 95,90 Q 90,100 75,95 Q 65,92 60,80 Z"
                                    fill="none"
                                    stroke="rgb(168, 85, 247)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    whileInView={{ pathLength: 1, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 2, delay: 0.3 }}
                                  />
                                  <motion.circle
                                    cx="60"
                                    cy="80"
                                    r="4"
                                    fill="rgb(236, 72, 153)"
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 2.3 }}
                                  />
                                </motion.svg>
                                {/* Pen cursor */}
                                <motion.div
                                  className="absolute w-6 h-6"
                                  initial={{ x: 60, y: 80, opacity: 0 }}
                                  whileInView={{ x: 95, y: 90, opacity: 1 }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 2, delay: 0.3 }}
                                >
                                  <Pen className="h-6 w-6 text-pink-500 rotate-45" />
                                </motion.div>
                              </div>
                              <div className="text-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-background/60 backdrop-blur-sm rounded-full border border-purple-500/30">
                                  <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                                  <span className="text-xs font-medium text-muted-foreground">Tracing hippocampus</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {index === 2 && (
                            // ML Analysis - Feature Processing Visualization
                            <div className="w-full space-y-6">
                              <div className="flex justify-center">
                                <div className={`p-6 rounded-2xl bg-gradient-to-br ${step.bgColor}`}>
                                  <Cpu className="h-20 w-20 text-amber-600" strokeWidth={1.5} />
                                </div>
                              </div>
                              <div className="grid grid-cols-5 gap-2">
                                {[...Array(15)].map((_, i) => (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0, rotate: -180 }}
                                    whileInView={{ opacity: [0, 1, 0.6], scale: 1, rotate: 0 }}
                                    viewport={{ once: true }}
                                    transition={{
                                      duration: 0.5,
                                      delay: 0.3 + i * 0.05,
                                      opacity: { duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }
                                    }}
                                    className="aspect-square rounded bg-gradient-to-br from-amber-500/40 to-orange-500/40 border border-amber-500/30"
                                  />
                                ))}
                              </div>
                              <div className="flex justify-center gap-2">
                                {[1, 2, 3].map((i) => (
                                  <motion.div
                                    key={i}
                                    className="h-2 w-2 rounded-full bg-amber-500"
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {index === 3 && (
                            // Feature Importance - Analysis Visualization
                            <div className="w-full space-y-4">
                              <div className="relative w-48 h-48 mx-auto rounded-xl overflow-hidden border-2 border-emerald-500/30">
                                {/* Base brain scan mockup */}
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />

                                {/* Heatmap overlays */}
                                <motion.div
                                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full"
                                  style={{
                                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.8) 0%, rgba(16, 185, 129, 0.4) 40%, transparent 70%)',
                                  }}
                                  animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: [0.6, 0.9, 0.6],
                                  }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                                <motion.div
                                  className="absolute top-1/3 left-1/3 w-16 h-16 rounded-full"
                                  style={{
                                    background: 'radial-gradient(circle, rgba(245, 158, 11, 0.7) 0%, rgba(245, 158, 11, 0.3) 50%, transparent 70%)',
                                  }}
                                  animate={{
                                    scale: [1.1, 1, 1.1],
                                    opacity: [0.5, 0.8, 0.5],
                                  }}
                                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                                />

                                {/* Grid overlay */}
                                <div className="absolute inset-0 opacity-20">
                                  <div className="w-full h-full bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:1rem_1rem]" />
                                </div>
                              </div>
                              <div className="flex justify-center gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                                  <span className="text-muted-foreground">High</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                                  <span className="text-muted-foreground">Medium</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="h-3 w-3 rounded-full bg-slate-600" />
                                  <span className="text-muted-foreground">Low</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {index === 4 && (
                            // PDF Report Generation
                            <div className="w-full space-y-4">
                              <div className="relative w-48 h-56 mx-auto">
                                {/* Document mockup */}
                                <motion.div
                                  className="absolute inset-0 bg-white rounded-lg shadow-2xl border border-slate-200"
                                  initial={{ y: 20, opacity: 0 }}
                                  whileInView={{ y: 0, opacity: 1 }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 0.5 }}
                                >
                                  {/* Document header */}
                                  <div className="p-4 space-y-3">
                                    <div className="flex items-center gap-2">
                                      <FileCheck className="h-5 w-5 text-rose-500" />
                                      <div className="h-2 w-20 bg-rose-500/30 rounded" />
                                    </div>
                                    <div className="space-y-2">
                                      <div className="h-2 bg-slate-200 rounded w-full" />
                                      <div className="h-2 bg-slate-200 rounded w-5/6" />
                                      <div className="h-2 bg-slate-200 rounded w-4/6" />
                                    </div>
                                    <div className="pt-2 border-t border-slate-200">
                                      <div className="h-16 bg-gradient-to-br from-rose-500/10 to-red-500/10 rounded" />
                                    </div>
                                    <div className="space-y-1.5">
                                      <div className="h-1.5 bg-slate-200 rounded w-full" />
                                      <div className="h-1.5 bg-slate-200 rounded w-4/5" />
                                      <div className="h-1.5 bg-slate-200 rounded w-5/6" />
                                    </div>
                                  </div>
                                </motion.div>

                                {/* PDF badge */}
                                <motion.div
                                  className="absolute -top-2 -right-2 bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                                  initial={{ scale: 0, rotate: -180 }}
                                  whileInView={{ scale: 1, rotate: 0 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: 0.5, type: "spring" }}
                                >
                                  PDF
                                </motion.div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Center Dot (Desktop) */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.15 + 0.3, type: "spring", stiffness: 200 }}
                    className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-gradient-to-r ${step.color} ring-4 ring-background`}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 100 }}
          className="mt-24 text-center"
        >
          <div className="inline-block bg-card border border-border rounded-2xl px-8 py-6 shadow-lg">
            <p className="text-sm text-muted-foreground mb-2">
              Average End-to-End Processing Time
            </p>
            <p className="font-heading font-bold text-4xl text-primary">
              Under 5 Minutes
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
