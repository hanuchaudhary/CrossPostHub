"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { registerSchema } from "@/lib/validation";
import { useAuthStore } from "@/store/AuthStore/useAuthStore";
import { useRouter } from "next/navigation";
import AuthWithGoogle from "./AuthWithGoogle";
import OrSeperator from "./OrSeperator";

export default function RegisterForm() {
  const { isLoading, registerAccount, error } = useAuthStore();
  const router = useRouter();
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    await registerAccount(values, () => router.push("/dashboard"));
  }

  return (
    <div className="min-h-[calc(100vh-150px)] relative flex items-center justify-center p-4">
      <div className="w-full max-w-md md:space-y-8 space-y-4 relative z-10 dark:border-none border border-neutral-300 dark:p-0 p-6 rounded-3xl shadow-sm">
        <div className="leading-none">
          <h1 className="md:text-4xl text-3xl font-ClashDisplayRegular">
            Register
          </h1>
          <p className="text-neutral-400 text-sm">
            Already have an account?{" "}
            <Link
              href="/signin"
              replace
              className="text-blue-500 underline hover:text-blue-400"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-400 text-xs">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter name"
                        className="focus-visible:ring-0 md:text-base text-sm bg-secondary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-400 text-xs">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        className="focus-visible:ring-0 bg-secondary md:text-base text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-400 text-xs">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Create a password"
                        className="focus-visible:ring-0 bg-secondary md:text-base text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-end">
                <Button
                  disabled={isLoading}
                  type="submit"
                  className="rounded-full"
                  size={"sm"}
                >
                  {isLoading ? "Registering..." : "Continue"}
                </Button>
              </div>
            </form>
          </Form>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <OrSeperator />
          <AuthWithGoogle />

          <p className="text-[10px] text-neutral-400 text-center">
            By creating an account you accept our{" "}
            <Link
              href="/privacy"
              className="text-neutral-500 font-semibold underline hover:text-neutral-400"
            >
              privacy policies
            </Link>{" "}
            &{" "}
            <Link
              href="/terms"
              className="text-neutral-500 font-semibold underline hover:text-neutral-400"
            >
              terms and conditions
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
