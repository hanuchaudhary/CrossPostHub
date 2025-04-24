"use client";
import React from "react";

export default function CanvasPreview() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  return (
    <div className="w-full h-full flex justify-center items-center bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-700 font-ClashDisplaySemibold">Under Construction..</h1>
    </div>
  );
}
