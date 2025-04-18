import { EditorNavbar } from "@/components/EditComponents/EditNavbar";
import React from "react";

type Props = {
  children: React.ReactNode;
};

export default function EditLayout({ children }: Props) {
  return (
    <div className="p-3 w-full">
      <div className="inline-block mb-2">
        <EditorNavbar />
      </div>
      {children}
    </div>
  );
}
