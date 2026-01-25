"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { signUpSchema, type SignUpFormData, roleOptions } from "@/lib/validations/auth";
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

  const onSubmit = async (data: SignUpFormData) => {
    // Mock submission for now
    console.log("Sign Up Data:", data);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // TODO: Implement Supabase authentication
    // const { data: authData, error } = await supabase.auth.signUp({
    //   email: data.email,
    //   password: data.password,
    //   options: {
    //     data: {
    //       full_name: data.fullName,
    //       role: data.role,
    //       institution: data.institution,
    //       contact_number: data.contactNumber,
    //     },
    //   },
    // });

    alert("Sign up successful! (Mock)");
    reset();
    onOpenChange(false);
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  error={errors.password?.message}
                  {...register("password")}
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" required>
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />
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
