"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validations/auth";
import { resetPassword } from "@/lib/auth/actions";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBackToSignIn: () => void;
}

export function ForgotPasswordModal({
  open,
  onOpenChange,
  onBackToSignIn,
}: ForgotPasswordModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError(null);

      const result = await resetPassword(data.email);

      if (!result.success && result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      // Success - show confirmation message
      setSubmittedEmail(data.email);
      setIsSuccess(true);
      toast.success("Password reset email sent!");
    } catch (err: any) {
      console.error("Forgot password error:", err);
      const errorMessage = err.message || "An unexpected error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleBackToSignIn = () => {
    setError(null);
    setIsSuccess(false);
    setSubmittedEmail("");
    reset();
    onOpenChange(false);
    setTimeout(() => onBackToSignIn(), 200);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setError(null);
      setIsSuccess(false);
      setSubmittedEmail("");
      reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <KeyRound className="h-6 w-6 text-primary" strokeWidth={2} />
            </div>
            <DialogTitle>
              {isSuccess ? "Check Your Email" : "Forgot Password"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {isSuccess
              ? "We've sent you a password reset link. Please check your inbox and follow the instructions."
              : "Enter your email address and we'll send you a link to reset your password."}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          {isSuccess ? (
            <div className="space-y-5">
              {/* Success State */}
              <div className="p-6 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
                <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                  Reset link sent to:
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  {submittedEmail}
                </p>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSuccess(false);
                    setError(null);
                  }}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  try again
                </button>
              </p>

              {/* Back to Sign In */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={handleBackToSignIn}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Error Alert */}
              {error && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="forgot-email" required>
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="your.email@hospital.com"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Reset Link
                  </>
                )}
              </Button>

              {/* Back to Sign In */}
              <div className="text-center pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleBackToSignIn}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
