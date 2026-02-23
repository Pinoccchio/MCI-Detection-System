"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus, CheckCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { signUpSchema, type SignUpFormData, roleOptions } from "@/lib/validations/auth";
import { signUp } from "@/lib/auth/actions";
import { UserRole } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface SignUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignIn: () => void;
}

export function SignUpModal({
  open,
  onOpenChange,
  onSwitchToSignIn,
}: SignUpModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: undefined,
      institution: "",
      contactNumber: "",
      acceptTerms: false,
    },
  });

  // Reset state when modal closes and cleanup timeout on unmount
  useEffect(() => {
    if (!open) {
      setError(null);
      setSuccess(false);
      setRequiresConfirmation(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
      reset();
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [open, reset]);

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setError(null);
      setSuccess(false);

      // Call Supabase auth sign up action
      const result = await signUp(
        data.email,
        data.password,
        data.fullName,
        data.role as UserRole,
        data.institution,
        data.contactNumber
      );

      if (!result.success && result.error) {
        setError(result.error);
        return;
      }

      // Success
      setSuccess(true);
      setRequiresConfirmation(result.requiresEmailConfirmation || false);

      // If email confirmation required, show message and keep modal open
      if (result.requiresEmailConfirmation) {
        // Don't close modal - user needs to see confirmation message
        return;
      }

      // Otherwise redirect to sign in after short delay
      timeoutRef.current = setTimeout(() => {
        reset();
        onOpenChange(false);
        onSwitchToSignIn();
      }, 2000);
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message || 'An unexpected error occurred');
    }
  };

  const handleSwitchToSignIn = () => {
    reset();
    onOpenChange(false);
    setTimeout(() => onSwitchToSignIn(), 200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
              <UserPlus className="h-6 w-6 text-accent" strokeWidth={2} />
            </div>
            <DialogTitle>Create Account</DialogTitle>
          </div>
          <DialogDescription>
            Join the MCI Detection System to access advanced AI-powered analysis
            for early Alzheimer's detection.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          {/* Success Message */}
          {success && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 mb-5">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Account created successfully!</p>
                  {requiresConfirmation ? (
                    <p className="text-sm mt-1">
                      Please check your email to confirm your account before signing in.
                    </p>
                  ) : (
                    <p className="text-sm mt-1">
                      Redirecting to sign in...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Error Alert */}
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="fullName" required>
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Dr. Juan Dela Cruz"
                  error={errors.fullName?.message}
                  {...register("fullName")}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" required>
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@hospital.com"
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>

              {/* Contact Number */}
              <div className="space-y-2">
                <Label htmlFor="contactNumber" required>
                  Contact Number
                </Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  placeholder="+63 917 123 4567"
                  error={errors.contactNumber?.message}
                  {...register("contactNumber")}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" required>
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    error={errors.password?.message}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" required>
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    error={errors.confirmPassword?.message}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role" required>
                  Role
                </Label>
                <Select
                  id="role"
                  options={roleOptions}
                  error={errors.role?.message}
                  {...register("role")}
                />
                <p className="text-xs text-muted-foreground">
                  Select your professional role in the system
                </p>
              </div>

              {/* Institution */}
              <div className="space-y-2">
                <Label htmlFor="institution" required>
                  Institution / Organization
                </Label>
                <Input
                  id="institution"
                  type="text"
                  placeholder="Manila General Hospital"
                  error={errors.institution?.message}
                  {...register("institution")}
                />
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="pt-2">
              <Checkbox
                label={
                  <span>
                    I accept the{" "}
                    <Link
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 font-semibold underline"
                    >
                      Terms and Conditions
                    </Link>
                    {" "}and{" "}
                    <Link
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 font-semibold underline"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                }
                error={errors.acceptTerms?.message}
                {...register("acceptTerms")}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>

            {/* Sign In Link */}
            <div className="text-center pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={handleSwitchToSignIn}
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
