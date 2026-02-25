import { z } from "zod";

// Sign In Schema
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export type SignInFormData = z.infer<typeof signInSchema>;

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Reset Password Schema
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Sign Up Schema
export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Full name is required")
      .min(3, "Full name must be at least 3 characters")
      .regex(/^[a-zA-Z\s.'-]+$/, "Please enter a valid name"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.enum(
      ["admin", "clinician", "researcher"],
      {
        message: "Please select a role",
      }
    ),
    institution: z
      .string()
      .min(1, "Institution/Organization is required")
      .min(3, "Institution name must be at least 3 characters"),
    contactNumber: z
      .string()
      .min(1, "Contact number is required")
      .regex(
        /^(\+63|0)[9]\d{9}$/,
        "Please enter a valid Philippine mobile number (e.g., +639XXXXXXXXX or 09XXXXXXXXX)"
      ),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, {
        message: "You must accept the terms and conditions",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;

// Role options for dropdown (consistent order: Admin → Clinician → Researcher)
export const roleOptions = [
  {
    value: "",
    label: "Select your role",
  },
  {
    value: "admin",
    label: "Admin / Radiologist",
  },
  {
    value: "clinician",
    label: "Clinician / Neurologist",
  },
  {
    value: "researcher",
    label: "Researcher",
  },
];
