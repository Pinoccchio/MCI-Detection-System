"use client";

import { motion } from "framer-motion";
import { ArrowRight, Upload, Sparkles, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-accent/5">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        {/* Floating Orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-6"
          >
            <Badge
              variant="secondary"
              className="px-4 py-2 text-sm font-medium border border-primary/20 shadow-lg shadow-primary/10"
            >
              <Sparkles className="h-3.5 w-3.5 mr-2 inline" />
              AI-Powered Neuroimaging Analysis
            </Badge>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-foreground mb-6 leading-[1.1]"
          >
            Early Detection of{" "}
            <span className="text-primary relative inline-block">
              Alzheimer's
              <svg
                className="absolute -bottom-2 left-0 w-full"
                height="12"
                viewBox="0 0 300 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <motion.path
                  d="M2 10C50 5, 150 2, 298 8"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.5 }}
                  transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
                />
              </svg>
            </span>
            <br />
            Through Hippocampal Analysis
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Advanced 2D CNN technology analyzes hippocampal-segmented MRI masks
            to classify Mild Cognitive Impairment with{" "}
            <span className="text-foreground font-semibold">
              clinical-grade precision
            </span>
            .
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="text-base px-8 h-12 shadow-xl shadow-primary/30 group"
            >
              <Upload className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Start Analysis
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 h-12 border-2"
            >
              View Demo
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto"
          >
            {[
              { value: "95%+", label: "Classification Accuracy" },
              { value: "<2min", label: "Analysis Time" },
              { value: "FDA", label: "Compliance Ready" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="text-center"
              >
                <div className="font-heading font-bold text-3xl sm:text-4xl text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Visual Element - Brain Scan Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 relative"
          >
            <div className="relative mx-auto max-w-4xl">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl blur-3xl" />

              {/* Mock Dashboard Image Placeholder */}
              <div className="relative bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-muted via-background to-accent/10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block p-6 bg-primary/10 rounded-full mb-4">
                      <Brain className="h-16 w-16 text-primary" />
                    </div>
                    <p className="text-muted-foreground font-mono text-sm">
                      Dashboard Preview
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-4 top-20 bg-card border border-border rounded-lg shadow-xl p-4 hidden lg:block"
              >
                <div className="text-xs text-muted-foreground mb-1">
                  Classification
                </div>
                <div className="font-semibold text-primary">MCI Detected</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Confidence: 94.2%
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -right-4 bottom-20 bg-card border border-border rounded-lg shadow-xl p-4 hidden lg:block"
              >
                <div className="text-xs text-muted-foreground mb-1">
                  Volumetry
                </div>
                <div className="font-semibold">3,245 mm³</div>
                <div className="text-xs text-destructive mt-1">↓ 18% atrophy</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
