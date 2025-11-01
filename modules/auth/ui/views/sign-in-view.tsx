"use client";
import { useForm } from "@tanstack/react-form";
import {
  signInFormSchema,
  SignInFormSchema,
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
export const SignInView = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    } as SignInFormSchema,
    validators: {
      onSubmit: signInFormSchema,
    },
    onSubmit: ({ value }) => {
      signIn.email(
        {
          email: value.email,
          password: value.password,
          callbackURL: "/profile",
        },
        {
          onRequest: () => {
            setIsSubmitting(true);
          },
          onSuccess: () => {
            setIsSubmitting(false);
            toast.success("SignIn successfully");
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
        <CardTitle>Sign in to your account</CardTitle>
        <CardDescription>
          Welcome back! Access your workspace and continue where you left off.
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
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                const result = signInFormSchema.shape.email.safeParse(value);
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
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Enter your email"
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
          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => {
                const result = signInFormSchema.shape.password.safeParse(value);
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

          <Button
            type="submit"
            className="w-full mt-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <Separator className="w-full my-4" />
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
        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link href="/sign-up" className="font-medium hover:underline">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};
