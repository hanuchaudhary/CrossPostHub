import { toast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";

export const customToast = (message: string) => {
  toast({
    title: "Twitter Character Limit Exceeded",
    description: (
      <div className="w-full">
        <Badge className="my-2" variant="destructive">
          Error
        </Badge>
        <div className="text-xs">
          <p>
            Your Twitter post exceeds the character limit of 280 characters.
            Please reduce the content length to continue.
          </p>
          <span className="text-neutral-500 text-xs">
            {new Date().toLocaleDateString()}
          </span>
        </div>
        <p className="font-ClashDisplayMedium text-right pt-3 tracking-tighter text-emerald-500">
          CrossPostHub.
        </p>
      </div>
    ),
  });
};
