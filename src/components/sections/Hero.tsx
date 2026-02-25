"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Upload, Sparkles, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRef, MouseEvent } from "react";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Parallax transforms
  const dnaY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const dnaRotate = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const neuralY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const waveY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 300]);

  // Magnetic button effect
  const buttonX = useMotionValue(0);
  const buttonY = useMotionValue(0);
  const buttonSpringX = useSpring(buttonX, { stiffness: 150, damping: 15 });
  const buttonSpringY = useSpring(buttonY, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    buttonX.set(distanceX * 0.3);
    buttonY.set(distanceY * 0.3);
  };

  const handleMouseLeave = () => {
    buttonX.set(0);
    buttonY.set(0);
  };

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-accent/5">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8884_1px,transparent_1px),linear-gradient(to_bottom,#8884_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        {/* Medical-themed SVG Patterns */}
        {/* DNA Helix Pattern - Top Left with Parallax */}
        <motion.svg
          style={{ y: dnaY, rotate: dnaRotate }}
          className="absolute -top-20 -left-20 w-96 h-96 opacity-[0.08]"
          viewBox="0 0 200 200"
        >
          <defs>
            <linearGradient id="dnaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" />
              <stop offset="100%" stopColor="rgb(37, 99, 235)" />
            </linearGradient>
          </defs>
          {/* DNA double helix strands */}
          <path
            d="M 40,20 Q 60,50 40,80 Q 20,110 40,140 Q 60,170 40,200"
            stroke="url(#dnaGradient)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 80,20 Q 60,50 80,80 Q 100,110 80,140 Q 60,170 80,200"
            stroke="url(#dnaGradient)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          {/* Connecting rungs */}
          {[30, 50, 70, 90, 110, 130, 150, 170].map((y) => (
            <line
              key={y}
              x1="40"
              y1={y}
              x2="80"
              y2={y}
              stroke="url(#dnaGradient)"
              strokeWidth="2"
              opacity="0.6"
            />
          ))}
        </motion.svg>

        {/* Neural Network Pattern - Bottom Right with Parallax */}
        <motion.svg
          style={{ y: neuralY }}
          animate={{ opacity: [0.04, 0.10, 0.04] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 -right-20 w-[500px] h-[500px]"
          viewBox="0 0 200 200"
        >
          <defs>
            <radialGradient id="neuralGradient">
              <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgb(20, 184, 166)" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Nodes */}
          {[[30, 40], [70, 30], [50, 80], [90, 70], [110, 100], [140, 60], [120, 130], [160, 110]].map(([cx, cy], i) => (
            <motion.circle
              key={i}
              cx={cx}
              cy={cy}
              r="4"
              fill="rgb(16, 185, 129)"
              opacity="0.6"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 3, delay: i * 0.3, repeat: Infinity }}
            />
          ))}
          {/* Connections */}
          <path d="M 30,40 L 70,30 L 50,80 L 90,70 M 90,70 L 110,100 L 140,60 M 110,100 L 120,130 L 160,110" stroke="rgb(16, 185, 129)" strokeWidth="1" opacity="0.3" fill="none" />
          {/* Large glow circle */}
          <circle cx="100" cy="85" r="80" fill="url(#neuralGradient)" />
        </motion.svg>

        {/* Brain Wave Pattern - Center with Parallax */}
        <motion.svg
          style={{ y: waveY }}
          animate={{ x: [-20, 20, -20] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-32 opacity-[0.06]"
          viewBox="0 0 600 100"
          preserveAspectRatio="none"
        >
          <path
            d="M 0,50 Q 50,20 100,50 T 200,50 T 300,50 T 400,50 T 500,50 T 600,50"
            stroke="rgb(147, 51, 234)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 0,50 Q 50,65 100,50 T 200,50 T 300,50 T 400,50 T 500,50 T 600,50"
            stroke="rgb(168, 85, 247)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
        </motion.svg>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
              className="mb-6"
            >
              <Badge
                variant="secondary"
                className="px-4 py-2 text-sm font-medium border border-primary/20 shadow-lg shadow-primary/10"
              >
                <Sparkles className="h-3.5 w-3.5 mr-2 inline" />
                ML-Powered Neuroimaging Analysis
              </Badge>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, type: "spring", stiffness: 80, damping: 15 }}
              className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-foreground mb-6 leading-[1.05]"
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
                    transition={{ duration: 2, delay: 1.6, ease: "easeInOut" }}
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
              transition={{ duration: 0.8, delay: 0.7, type: "spring", stiffness: 100 }}
              className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-2xl"
            >
              Advanced ML technology analyzes hippocampal-segmented MRI masks
              to classify Mild Cognitive Impairment with{" "}
              <span className="text-foreground font-semibold">
                clinical-grade precision
              </span>
              .
            </motion.p>

            {/* CTA Buttons with Magnetic Effect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1, type: "spring", stiffness: 100 }}
              className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mb-10"
            >
              <motion.div
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ x: buttonSpringX, y: buttonSpringY }}
                className="relative group/btn"
              >
                <Button
                  size="lg"
                  className="text-base px-8 h-12 shadow-xl shadow-primary/30 group relative overflow-hidden"
                >
                  {/* Animated gradient on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    style={{ opacity: 0.2 }}
                  />
                  <Upload className="mr-2 h-5 w-5 group-hover:scale-110 group-hover:rotate-12 transition-transform relative z-10" />
                  <span className="relative z-10">Start Analysis</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform relative z-10" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.3 }}
              className="grid grid-cols-1 xs:grid-cols-3 gap-4 sm:gap-6 max-w-xl mx-auto lg:mx-0"
            >
              {[
                { value: "81%", label: "Classification Accuracy" },
                { value: "0.88", label: "ROC AUC Score" },
                { value: "87%", label: "MCI Detection Rate" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6, delay: 1.5 + index * 0.2, type: "spring", stiffness: 120 }}
                  className="text-center xs:text-left cursor-default relative group"
                >
                  {/* Animated underline on hover */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-accent"
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="font-heading font-bold text-3xl sm:text-4xl text-primary mb-1 group-hover:text-accent transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Column - Single Unified Dashboard */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, x: 40, y: 40 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 1, delay: 2.1, type: "spring", stiffness: 60 }}
              className="relative"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent rounded-2xl blur-3xl" />

              {/* Single Unified Dashboard Card */}
              <div className="relative bg-card/80 backdrop-blur-md border-2 border-border rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-br from-background via-card to-accent/5 p-6 md:p-8">
                  {/* Dashboard Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Brain className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-sm">MCI Analysis</h3>
                        <p className="text-xs text-muted-foreground">Patient Dashboard</p>
                      </div>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  </div>

                  {/* Scan Visualization Mockup */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 mb-6 relative overflow-hidden">
                    {/* Grid overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:1rem_1rem]" />

                    {/* Brain scan placeholder with hippocampus highlight */}
                    <div className="relative h-32 flex items-center justify-center">
                      <svg className="w-24 h-24 opacity-40" viewBox="0 0 100 100">
                        {/* Brain outline */}
                        <ellipse cx="50" cy="50" rx="35" ry="40" stroke="rgb(148, 163, 184)" strokeWidth="2" fill="none" />
                        <path d="M 30,50 Q 35,35 50,30 Q 65,35 70,50" stroke="rgb(148, 163, 184)" strokeWidth="2" fill="none" />
                        {/* Hippocampus region highlighted */}
                        <ellipse cx="40" cy="55" rx="8" ry="12" fill="rgb(59, 130, 246)" opacity="0.6" />
                        <ellipse cx="60" cy="55" rx="8" ry="12" fill="rgb(59, 130, 246)" opacity="0.6" />
                      </svg>
                      <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent" />
                    </div>
                  </div>

                  {/* Classification Result */}
                  <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Classification</p>
                        <p className="font-heading font-bold text-lg text-primary">MCI Detected</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                        <p className="font-heading font-bold text-2xl text-foreground">86.7%</p>
                      </div>
                    </div>
                  </div>

                  {/* Volumetry Result */}
                  <div className="bg-accent/5 border-l-4 border-accent rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Volumetry</p>
                        <p className="font-heading font-bold text-lg text-foreground">3,245 mm³</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <p className="text-sm font-semibold text-destructive flex items-center gap-1 justify-end">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 3a1 1 0 01.894.553l6 12A1 1 0 0116 17H4a1 1 0 01-.894-1.447l6-12A1 1 0 0110 3z" />
                          </svg>
                          18% atrophy
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Model Info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <p className="font-heading font-semibold text-sm text-primary">Analyzed</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Model</p>
                      <p className="font-heading font-semibold text-sm">ML Model</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
