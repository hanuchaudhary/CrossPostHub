import SigninForm from '@/components/AuthComponents/SigninForm'
import React from 'react'
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signin | CrosspostHub",
  description: "Sign in to your CrosspostHub account. Access your dashboard and manage your crossposting settings.",
};

export default function Signin() {
  return (
    <div>
      <SigninForm/>
    </div>
  )
}
