import { toast } from "@/hooks/use-toast";

type CustomToastProps = {
  title: string;
  description: string;
  badgeVariant?:
    | "default"
    | "destructive"
    | "success"
    | "secondary"
    | "outline"
    | "pending";
};

export const customToast = (props: CustomToastProps) => {
  toast({
    title: props.title,
    description: (
      <div className="w-full">
        <div className="text-xs text-muted-foreground">
          <p>{props.description}</p>
          {/* <span className="text-neutral-500 text-xs">
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span> */}
        </div>
        <p className="font-ClashDisplayMedium text-right pt-3 tracking-tighter text-emerald-500">
          CrossPostHub.
        </p>
      </div>
    ),
  });
  return null;
};
