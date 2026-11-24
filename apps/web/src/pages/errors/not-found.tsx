import { Link } from "react-router";
import { Brand } from "@/components/ui/brand";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 p-5">
      <Brand />
      <Empty>
        <EmptyHeader>
          <EmptyTitle>This page hasn’t been created yet.</EmptyTitle>
          <EmptyDescription>A little off the beaten path.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button nativeButton={false} render={<Link to="/" />}>
            Let’s head home →
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}
