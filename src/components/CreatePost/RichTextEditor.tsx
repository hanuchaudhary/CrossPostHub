"use client";

import React from "react";
import { Editor } from "@tinymce/tinymce-react";

interface RichTextEditorProps {
  content: string;
  setContent: (content: string) => void;
}

export function RichTextEditor({ content, setContent }: RichTextEditorProps) {
  return (
    <Editor
      apiKey="st65dqd0b5xx9p950uwt90z1rij4r2yp61pe0z3kzsply75y"
      value={content}
      onEditorChange={(newContent) => setContent(newContent)}
      init={{
        height: 300,
        menubar: false,
        plugins: [
          "advlist",
          "autolink",
          "lists",
          "link",
          "image",
          "charmap",
          "preview",
          "anchor",
          "searchreplace",
          "visualblocks",
          "code",
          "fullscreen",
          "insertdatetime",
          "media",
          "table",
          "code",
          "help",
          "wordcount",
        ],
        toolbar:
          "undo redo | blocks | " +
          "bold italic forecolor | alignleft aligncenter " +
          "alignright alignjustify | bullist numlist outdent indent | " +
          "removeformat | help",
        content_style:
          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
      }}
    />
  );
}
