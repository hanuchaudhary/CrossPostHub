import { EditorNavbar } from "@/components/EditComponents/EditNavbar";
import React from "react";

type Props = {
  children: React.ReactNode;
};

export default function EditLayout({ children }: Props) {
  return (
    <div className="mx-auto p-4">
      <div className="inline-block mb-4">
        <EditorNavbar />
      </div>
      {children}
    </div>
  );
}
