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
import { useRouter } from "next/navigation";
import { signinSchema } from "@/lib/validation";
import { signIn, useSession } from "next-auth/react";
import { useState } from "react";

export default function SigninForm() {
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof signinSchema>>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signinSchema>) {
    signIn();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="leading-none">
          <h1 className="text-4xl font-ClashDisplayMedium">Sign in</h1>
          <p className="text-neutral-400 font-ClashDisplayRegular">
            Not have an account yet?{" "}
            <Link
              replace
              href="/auth/register"
              className="text-blue-500 underline hover:text-blue-400"
            >
              Create One!
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
              {error && <div className="text-red-400 text-sm">{error}</div>}
              <Button disabled={isLoading} type="submit" className="w-full">
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-b">Or</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
