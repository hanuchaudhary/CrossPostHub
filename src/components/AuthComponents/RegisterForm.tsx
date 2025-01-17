"use client";

import { motion } from "framer-motion";
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

export default function RegisterForm() {
  const { isLoading, registerAccount, error } = useAuthStore();
  const router = useRouter();
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    await registerAccount(values, () => router.push("/dashboard"));
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="leading-none">
          <h1 className="text-4xl font-ClashDisplayMedium">Register</h1>
          <p className="text-neutral-400 font-ClashDisplayRegular">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              replace
              className="text-blue-500 underline hover:text-blue-400"
            >
              Sign in
            </Link>
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-400">Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter username"
                        className=""
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
                    <FormLabel className="text-neutral-400">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        className=""
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
                    <FormLabel className="text-neutral-400">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Create a password"
                        className=""
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <Button disabled={isLoading} type="submit" className="w-full">
                {isLoading ? "Registering..." : "Register"}
              </Button>
            </form>
          </Form>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-b">Or</span>
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            disabled={isLoading}
            variant="outline"
            className="w-full bg-transparent border-neutral-700 text-white hover:bg-neutral-800"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Continue with Google
          </Button>

          {/* Terms */}
          <p className="text-sm text-neutral-400 text-center">
            By creating an account you accept our{" "}
            <Link
              href="/privacy"
              className="text-neutral-500 hover:text-neutral-400"
            >
              privacy policies
            </Link>{" "}
            &{" "}
            <Link
              href="/terms"
              className="text-neutral-500 hover:text-neutral-400"
            >
              terms and conditions
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
