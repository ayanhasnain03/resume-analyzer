import { z } from "zod";

export const signUpFormSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z.string().min(8, {
      message: "Confirm password must be at least 8 characters long",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export const signInFormSchema = z.object({
  email: z.email().min(5, "Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});
export type SignUpFormSchema = z.infer<typeof signUpFormSchema>;
export type SignInFormSchema = z.infer<typeof signInFormSchema>;
