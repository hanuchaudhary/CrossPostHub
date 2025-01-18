import SigninForm from '@/components/AuthComponents/SigninForm'
import React from 'react'
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signin | CrossPost Hub",
  description: "CrossPost Hub's Signin.",
};

export default function Signin() {
  return (
    <div>
      <SigninForm/>
    </div>
  )
}
