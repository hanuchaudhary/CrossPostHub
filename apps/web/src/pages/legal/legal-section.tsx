import type { ReactNode } from "react";

export const CONTACT_EMAIL = "kushchaudharyog@gmail.com";
export const EFFECTIVE_DATE = "November 26, 2026";

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-medium text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export function ContactLink() {
  return (
    <a
      href={`mailto:${CONTACT_EMAIL}`}
      className="text-foreground underline underline-offset-4"
    >
      {CONTACT_EMAIL}
    </a>
  );
}
