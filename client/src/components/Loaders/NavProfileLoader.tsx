import { Skeleton } from "@/components/ui/skeleton";

export function NavProfileLoader() {
  return (
    <div className="flex">
      <Skeleton className="w-60 rounded-xl border">
        <div className="p-1 gap-1 justify-between flex items-center">
          <div>
            <Skeleton className="h-11 w-11 rounded-full" />
          </div>
          <div className="flex flex-col w-full justify-center space-y-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-44" />
          </div>
        </div>
      </Skeleton>
    </div>
  );
}
