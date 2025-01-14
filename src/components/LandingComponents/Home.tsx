import React from "react";
import { Button } from "../ui/button";

export default function Home() {
  return (
    <div className="flex flex-col bg-gradient-to-br from-orange-500/20 via-transparent to-pink-500/40 rounded-3xl md:w-11/12 mx-auto my-5 gap-10 md:gap-[100px] pb-[50px] md:pb-0 md:flex-row items-center justify-center flex-grow selection:bg-primary selection:text-primary-foreground">
      <div>
        <div className="font-ClashDisplaySemibold text-center leading-none pt-10 md:pt-20">
          <h1 className="text-[40px] sm:text-[80px] lg:text-[100px]">Post Once,</h1>
          <h1 className="text-orange-500 text-[40px] sm:text-[80px] lg:text-[100px]">Share Everywhere!</h1>
        </div>
        <h2 className="text-center font-ClashDisplayRegular text-xl text-neutral-300 my-10">
          Effortlessly share content to Instagram, LinkedIn, Twitter, and more{" "}
          <span className="text-orange-500">—all at once.</span>
        </h2>
        <div className="flex items-center w-full justify-center md:py-20 gap-3">
          <Button className="md:px-14 md:py-6" size={"lg"}>Start Now</Button>
          <Button className="md:px-14 md:py-6" size={"lg"} variant={"outline"}>
            Learn How it Works
          </Button>
        </div>
      </div>
    </div>
  );
}
