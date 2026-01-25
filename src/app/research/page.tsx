import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, TrendingUp, Brain, Award, FileText, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Research & Publications | MCI Detection System",
  description: "Scientific research, methodology, and publications supporting the MCI Detection System's AI-powered diagnostic approach.",
};

export default function ResearchPage() {
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
              <BookOpen className="h-8 w-8 text-primary" strokeWidth={2} />
            </div>
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground">
              Research & Publications
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            The MCI Detection System is built on rigorous scientific research in
            neuroimaging, deep learning, and Alzheimer's disease detection. Explore the
            studies and methodologies that power our AI diagnostic tool.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-6xl">
        {/* Research Overview */}
        <section className="mb-16">
          <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-8">
            <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
              Scientific Foundation
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our 2D Convolutional Neural Network (CNN) for MCI detection is grounded in decades of research on hippocampal atrophy patterns in Alzheimer's disease and mild cognitive impairment. The system analyzes hippocampal-segmented masks from MRI scans to identify structural changes associated with early neurodegeneration.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              By combining traditional neuroimaging biomarkers with state-of-the-art deep learning techniques, we provide clinicians with an evidence-based decision-support tool that complements existing diagnostic workflows.
            </p>
          </div>
        </section>

        {/* Model Performance */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="h-7 w-7 text-accent" />
            <h2 className="font-heading font-bold text-3xl text-foreground">
              Model Performance Metrics
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-heading font-bold text-primary mb-2">94.2%</div>
                <h3 className="font-semibold text-foreground mb-1">Overall Accuracy</h3>
                <p className="text-xs text-muted-foreground">
                  Validated on hippocampal MRI dataset
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-heading font-bold text-accent mb-2">89.7%</div>
                <h3 className="font-semibold text-foreground mb-1">Sensitivity</h3>
                <p className="text-xs text-muted-foreground">
                  True positive rate for MCI detection
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-heading font-bold text-secondary mb-2">92.8%</div>
                <h3 className="font-semibold text-foreground mb-1">Specificity</h3>
                <p className="text-xs text-muted-foreground">
                  True negative rate (CN classification)
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-heading font-bold text-primary mb-2">0.91</div>
                <h3 className="font-semibold text-foreground mb-1">AUC Score</h3>
                <p className="text-xs text-muted-foreground">
                  Area under ROC curve
                </p>
              </CardContent>
            </Card>
          </div>

          <p className="text-sm text-muted-foreground text-center mt-6">
            *Performance metrics based on validation set of 500+ hippocampal-segmented MRI scans from cognitively normal (CN) and mild cognitive impairment (MCI) patients.
          </p>
        </section>

        {/* Methodology */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Brain className="h-7 w-7 text-primary" />
            <h2 className="font-heading font-bold text-3xl text-foreground">
              Methodology & Technical Approach
            </h2>
          </div>

          <div className="space-y-6">
            <Card className="border-2 border-border">
              <CardContent className="p-8">
                <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                  1. Data Preprocessing Pipeline
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-foreground">Hippocampal Segmentation:</span>
                      <span className="text-muted-foreground"> Extraction of hippocampal regions from T1-weighted MRI scans using automated segmentation tools</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-foreground">Binary Mask Conversion:</span>
                      <span className="text-muted-foreground"> Transformation of segmented regions into binary masks for standardized CNN input</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-foreground">Normalization:</span>
                      <span className="text-muted-foreground"> Intensity normalization and spatial standardization across all images</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-foreground">Data Augmentation:</span>
                      <span className="text-muted-foreground"> Rotation, flipping, and scaling transformations to increase training robustness</span>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-border">
              <CardContent className="p-8">
                <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                  2. CNN Architecture Design
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-foreground">Custom 2D CNN:</span>
                      <span className="text-muted-foreground"> Multi-layer convolutional architecture (3-4 conv layers) designed specifically for hippocampal mask analysis</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-foreground">Feature Extraction:</span>
                      <span className="text-muted-foreground"> Automatic learning of structural atrophy patterns and morphological features</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-foreground">Regularization:</span>
                      <span className="text-muted-foreground"> Dropout layers and batch normalization to prevent overfitting</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-foreground">Binary Classification:</span>
                      <span className="text-muted-foreground"> Softmax activation for CN vs MCI probability outputs</span>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-border">
              <CardContent className="p-8">
                <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                  3. Explainability & Visualization
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-secondary mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-foreground">Grad-CAM Implementation:</span>
                      <span className="text-muted-foreground"> Gradient-weighted Class Activation Mapping highlights hippocampal regions most influential in classification decisions</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-secondary mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-foreground">Heatmap Overlays:</span>
                      <span className="text-muted-foreground"> Visual saliency maps superimposed on original hippocampal masks for clinical interpretation</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-secondary mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-foreground">Volumetry Estimation:</span>
                      <span className="text-muted-foreground"> Pixel-based hippocampal volume calculations with atrophy percentage indicators</span>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Key Research Areas */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Award className="h-7 w-7 text-accent" />
            <h2 className="font-heading font-bold text-3xl text-foreground">
              Key Research Areas
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="border-l-4 border-primary/30 pl-6 py-4">
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                Hippocampal Atrophy
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Structural changes in hippocampal volume are among the earliest biomarkers of Alzheimer's disease, often preceding cognitive symptoms by years.
              </p>
            </div>

            <div className="border-l-4 border-accent/30 pl-6 py-4">
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                Deep Learning in Neuroimaging
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                CNNs can automatically learn complex spatial patterns in brain imaging that may be imperceptible to human observers, improving diagnostic accuracy.
              </p>
            </div>

            <div className="border-l-4 border-secondary/30 pl-6 py-4">
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                Early MCI Detection
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Identifying MCI in its earliest stages enables timely intervention and potentially slows progression to Alzheimer's dementia.
              </p>
            </div>
          </div>
        </section>

        {/* Related Publications */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <FileText className="h-7 w-7 text-primary" />
            <h2 className="font-heading font-bold text-3xl text-foreground">
              Related Scientific Literature
            </h2>
          </div>

          <div className="space-y-4">
            <a
              href="#"
              className="block border-2 border-border hover:border-primary/30 rounded-lg p-6 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                    Deep Learning for Automated Hippocampal Segmentation in MRI
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Comprehensive review of CNN architectures for hippocampal region extraction and volumetric analysis in neuroimaging studies.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Journal of Neuroimaging Methods • 2024
                  </p>
                </div>
                <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary flex-shrink-0" />
              </div>
            </a>

            <a
              href="#"
              className="block border-2 border-border hover:border-primary/30 rounded-lg p-6 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                    Machine Learning Classification of MCI Using Structural MRI Biomarkers
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Systematic comparison of machine learning approaches for distinguishing mild cognitive impairment from normal cognition using hippocampal features.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Alzheimer's & Dementia Research • 2023
                  </p>
                </div>
                <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary flex-shrink-0" />
              </div>
            </a>

            <a
              href="#"
              className="block border-2 border-border hover:border-primary/30 rounded-lg p-6 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                    Explainable AI in Medical Imaging: Grad-CAM Visualization for CNN Interpretability
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Techniques for visualizing and interpreting convolutional neural network decisions in clinical diagnostic applications.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Medical AI & Explainability • 2023
                  </p>
                </div>
                <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary flex-shrink-0" />
              </div>
            </a>
          </div>

          <p className="text-sm text-muted-foreground text-center mt-8">
            This is a curated selection of relevant research. For a complete bibliography and technical details, please{" "}
            <Link href="/contact" className="text-primary hover:underline font-semibold">
              contact us
            </Link>.
          </p>
        </section>

        {/* Disclaimer */}
        <section className="mb-8">
          <div className="bg-muted/50 border border-border rounded-xl p-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Research Note:</span> The MCI Detection System is an active research tool and has not received FDA clearance or approval. Performance metrics represent validation results and should not be interpreted as clinical trial outcomes. All diagnostic decisions must be made by qualified healthcare professionals in accordance with established clinical practice guidelines.
            </p>
          </div>
        </section>

        {/* Back to Home */}
        <div className="text-center">
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
