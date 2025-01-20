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
import { signIn } from "next-auth/react";
import { useState } from "react";
import AuthWithGoogle from "./AuthWithGoogle";
import { UserPlus2 } from "lucide-react";
import OrSeperator from "./OrSeperator";
import { toast } from "@/hooks/use-toast";

export default function SigninForm() {
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
    setIsLoading(true);
    setError(null);
    try {
      const result = await signIn("credentials", {
        ...values,
        redirect: false,
        callbackUrl: "http://localhost:3000/dashboard", // Explicit callback URL
      });

      if (result?.error) {
        toast({
          title: "error",
          description: result.error,
        });
        setError(result.error);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="h-full min-h-[calc(100vh-150px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="leading-none">
          <h1 className="text-4xl font-ClashDisplayRegular">Sign In</h1>
        </div>

        <motion.div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-400 text-xs">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        className="focus-visible:ring-0 bg-secondary border"
                        type="email"
                        autoComplete="email"
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
                    <FormLabel className="text-neutral-400 text-xs leading-none">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        className="focus-visible:ring-0 bg-secondary"
                        placeholder="Enter your password here"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              {error && (
                <div className="text-red-400 text-sm" role="alert">
                  {error}
                </div>
              )}
              <div className="w-full flex justify-end"> 
                <Button
                  disabled={isLoading}
                  type="submit"
                  size={"sm"}
                  className="rounded-full"
                >
                  {isLoading ? "Signing in..." : "Continue"}
                </Button>
              </div>
            </form>
          </Form>

          <OrSeperator />

          <div className="flex items-center justify-center flex-col gap-3">
            <AuthWithGoogle />
            <Link
              className="w-full flex items-center justify-center text-center rounded-full py-3 border "
              href="/register"
            >
              <UserPlus2 className="mr-2 h-6 w-6" />
              <span>Create a New Account</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
