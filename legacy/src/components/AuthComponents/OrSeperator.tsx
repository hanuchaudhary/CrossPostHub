import React from "react";

export default function OrSeperator() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-secondary" />
      </div>
      <div className="relative text-neutral-500 flex justify-center text-xs">
        <span className="px-2 ">Or</span>
      </div>
    </div>
  );
}
