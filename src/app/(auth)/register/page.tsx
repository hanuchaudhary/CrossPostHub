import RegisterForm from "@/components/AuthComponents/RegisterForm";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register Account | CrossPost Hub",
  description: "CrossPost Hub's Signup.",
};


export default function Register() {
  return (
    <div>
      <RegisterForm />
    </div>
  );
}
