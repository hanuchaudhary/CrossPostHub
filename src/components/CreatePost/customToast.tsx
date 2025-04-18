import { toast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";

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
        <Badge className="my-2" variant={props.badgeVariant || "default"}>
          {props.badgeVariant === "success"
            ? "Success"
            : props.badgeVariant === "pending"
              ? "Processing"
              : "Error"}
        </Badge>
        <div className="text-xs">
          <p>{props.description}</p>
          <span className="text-neutral-500 text-xs">
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
        <p className="font-ClashDisplayMedium text-right pt-3 tracking-tighter text-emerald-500">
          CrossPostHub.
        </p>
      </div>
    ),
  });
  return null;
};
