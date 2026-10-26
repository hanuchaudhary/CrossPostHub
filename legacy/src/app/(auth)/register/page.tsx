import RegisterForm from "@/components/AuthComponents/RegisterForm";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register Account | CrosspostHub",
  description: "Create an account to start using CrosspostHub. Join our community and enjoy seamless crossposting across multiple platforms.",
};


export default function Register() {
  return (
    <div>
      <RegisterForm />
    </div>
  );
}
