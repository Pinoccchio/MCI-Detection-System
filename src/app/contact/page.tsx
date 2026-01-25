"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Send, Clock, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mock submission - replace with actual implementation
    console.log("Contact Form Data:", formData);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    alert("Thank you for your message! We'll get back to you soon. (Mock submission)");

    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

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
              <MessageSquare className="h-8 w-8 text-primary" strokeWidth={2} />
            </div>
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground">
              Contact Us
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Have questions about the MCI Detection System? Need technical support or want to schedule a demo? We're here to help.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              {/* Contact Cards */}
              <div className="bg-card border-2 border-border rounded-xl p-6 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-foreground">
                    Email
                  </h3>
                </div>
                <a
                  href="mailto:marealeigh@gmail.com"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  marealeigh@gmail.com
                </a>
                <p className="text-xs text-muted-foreground mt-2">
                  For general inquiries and support
                </p>
              </div>

              <div className="bg-card border-2 border-border rounded-xl p-6 hover:border-accent/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <Phone className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-foreground">
                    Phone
                  </h3>
                </div>
                <a
                  href="tel:+639176398932"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  +63 917 639 8932
                </a>
                <p className="text-xs text-muted-foreground mt-2">
                  Monday - Friday, 9 AM - 6 PM PHT
                </p>
              </div>

              <div className="bg-card border-2 border-border rounded-xl p-6 hover:border-secondary/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-secondary/10">
                    <MapPin className="h-5 w-5 text-secondary" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-foreground">
                    Address
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  1257-E Mataas Na Lupa St.<br />
                  Malate, Manila<br />
                  Philippines
                </p>
              </div>

              <div className="bg-card border-2 border-border rounded-xl p-6 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-foreground">
                    Response Time
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We typically respond to inquiries within 24-48 hours during business days.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-card border-2 border-border rounded-xl p-8 md:p-10">
                <h2 className="font-heading font-bold text-2xl text-foreground mb-2">
                  Send us a Message
                </h2>
                <p className="text-muted-foreground mb-8">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" required>
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Dr. Juan Dela Cruz"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" required>
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@hospital.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject" required>
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="What is this regarding?"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message" required>
                      Message
                    </Label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="flex w-full rounded-lg border-2 border-border bg-background px-4 py-3 text-sm transition-all duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-primary resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-base"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By submitting this form, you agree to our{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </form>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-muted/30 rounded-xl p-6 text-center">
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                Technical Support
              </h3>
              <p className="text-sm text-muted-foreground">
                For technical issues or system troubleshooting, include your user role and a detailed description of the problem.
              </p>
            </div>
            <div className="bg-muted/30 rounded-xl p-6 text-center">
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                Demo Requests
              </h3>
              <p className="text-sm text-muted-foreground">
                Interested in seeing the MCI Detection System in action? Request a personalized demo for your institution.
              </p>
            </div>
            <div className="bg-muted/30 rounded-xl p-6 text-center">
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                Partnership Inquiries
              </h3>
              <p className="text-sm text-muted-foreground">
                Exploring research collaborations or institutional partnerships? We'd love to hear from you.
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
