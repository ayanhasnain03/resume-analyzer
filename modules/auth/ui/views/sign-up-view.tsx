"use client";
import { useForm } from "@tanstack/react-form";
import {
  type SignUpFormSchema,
  signUpFormSchema,
} from "@/modules/auth/form-schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const SignUpView = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    } as SignUpFormSchema,
    validators: {
      onSubmit: signUpFormSchema,
    },
    onSubmit: ({ value }) => {
      signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onRequest: () => setIsSubmitting(true),
          onSuccess: () => {
            setIsSubmitting(false);
            toast.success("Account created successfully");
            router.push("/sign-in");
          },
          onError: (data) => {
            setIsSubmitting(false);
            toast.error(data.error.message);
          },
        }
      );
    },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Join us today and get started in a few seconds.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          className="flex flex-col items-center gap-2"
          id="sign-up-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          {/* Name */}
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                const result = signUpFormSchema.shape.name.safeParse(value);
                return result.success
                  ? undefined
                  : result.error.issues[0]?.message;
              },
            }}
          >
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Full name</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="John Doe"
                  />
                  <FieldError
                    className="text-red-500 text-sm font-normal"
                    errors={field.state.meta.errors?.map((error) => ({
                      message:
                        typeof error === "string" ? error : error?.message,
                    }))}
                  />
                </Field>
              );
            }}
          </form.Field>

          {/* Email */}
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                const result = signUpFormSchema.shape.email.safeParse(value);
                return result.success
                  ? undefined
                  : result.error.issues[0]?.message;
              },
            }}
          >
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Email address</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="you@example.com"
                  />
                  <FieldError
                    className="text-red-500 text-sm font-normal"
                    errors={field.state.meta.errors?.map((error) => ({
                      message:
                        typeof error === "string" ? error : error?.message,
                    }))}
                  />
                </Field>
              );
            }}
          </form.Field>

          {/* Password */}
          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => {
                const result = signUpFormSchema.shape.password.safeParse(value);
                return result.success
                  ? undefined
                  : result.error.issues[0]?.message;
              },
            }}
          >
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Enter your password"
                  />
                  <FieldError
                    className="text-red-500 text-sm font-normal"
                    errors={field.state.meta.errors?.map((error) => ({
                      message:
                        typeof error === "string" ? error : error?.message,
                    }))}
                  />
                </Field>
              );
            }}
          </form.Field>

          {/* Confirm password */}
          <form.Field
            name="confirmPassword"
            validators={{
              onChange: ({ value, fieldApi }) => {
                const password = fieldApi.form.getFieldValue("password");
                const result =
                  signUpFormSchema.shape.confirmPassword.safeParse(value);
                if (!result.success) {
                  return result.error.issues[0]?.message;
                }
                if (value !== password) {
                  return "Passwords do not match";
                }
                return undefined;
              },
            }}
          >
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Confirm password</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Re-enter your password"
                  />
                  <FieldError
                    className="text-red-500 text-sm font-normal"
                    errors={field.state.meta.errors?.map((error) => ({
                      message:
                        typeof error === "string" ? error : error?.message,
                    }))}
                  />
                </Field>
              );
            }}
          </form.Field>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full mt-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Creating account...
              </>
            ) : (
              "Sign up"
            )}
          </Button>
        </form>

        <Separator className="w-full my-4" />

        {/* Google */}
        <div className="w-full flex flex-col items-center gap-2 justify-center mb-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              signIn.social({
                provider: "google",
                callbackURL: "/",
              });
            }}
          >
            <Image
              src="/assets/icons/google.svg"
              alt="Google"
              width={20}
              height={20}
            />
            Continue with Google
          </Button>
        </div>

        {/* Footer */}
        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};
