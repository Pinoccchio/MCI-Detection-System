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
  rememberMe: z.boolean().optional(),
});

export type SignInFormData = z.infer<typeof signInSchema>;

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
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.enum(
      ["admin_radiologist", "clinician_neurologist", "researcher"],
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

// Role options for dropdown
export const roleOptions = [
  {
    value: "",
    label: "Select your role",
  },
  {
    value: "admin_radiologist",
    label: "Admin / Radiologist",
  },
  {
    value: "clinician_neurologist",
    label: "Clinician / Neurologist",
  },
  {
    value: "researcher",
    label: "Researcher",
  },
];
