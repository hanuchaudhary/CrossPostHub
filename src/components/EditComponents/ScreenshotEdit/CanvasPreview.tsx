"use client";
import React from "react";

export default function CanvasPreview() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  return (
    <div>
      <canvas height={700} width={1000} ref={canvasRef} className="w-full h-full bg-secondary" />
    </div>
  );
}
