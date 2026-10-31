import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm/relaxed font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer rounded-full py-5 px-6!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        primary: [
          "border-[#0072e5] bg-linear-to-b from-[#60c5f8] to-[#0072e5] text-white transition-all! duration-300!",
          "shadow-[inset_0_1px_0_#ffffffb3,inset_0_0_0_1px_#ffffff26,inset_0_-2px_0_#005bb840,0_2px_3px_#0072e526]",
          "hover:not-disabled:not-aria-disabled:not-data-disabled:from-[#75d8fc] hover:not-disabled:not-aria-disabled:not-data-disabled:to-[#007ef8]",
          "dark:border-[#60c5f8] dark:from-[#60c5f8] dark:to-[#0072e5] dark:shadow-[inset_0_1px_0_#ffffff66,inset_0_0_0_1px_#ffffff26,inset_0_-2px_0_#005bb840,0_2px_3px_#00000040]",
          "active:bg-linear-to-t data-pressed:bg-linear-to-t aria-expanded:bg-linear-to-t",
          "active:shadow-[inset_0_0_0_1px_#ffffff26,inset_0_-2px_0_#005bb840] data-pressed:shadow-[inset_0_0_0_1px_#ffffff26,inset_0_-2px_0_#005bb840] aria-expanded:shadow-[inset_0_0_0_1px_#ffffff26,inset_0_-2px_0_#005bb840]",
        ],
        outline:
          "border-border hover:bg-input/50 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:bg-input/30",
        secondary: [
          "border-[#dedede] bg-linear-to-b from-white to-[#f7f7f7] text-neutral-900",
          "shadow-[inset_0_1px_0_#fff,inset_0_0_0_1px_#ffffff80,inset_0_-2px_0_#00000008,0_2px_3px_#0000000a]",
          "hover:not-disabled:not-aria-disabled:not-data-disabled:to-[#ededed]",
          "dark:border-[#494949] dark:from-[#353535] dark:to-[#292929] dark:text-neutral-100 dark:shadow-[inset_0_1px_0_#ffffff1f,inset_0_0_0_1px_#ffffff06,inset_0_-2px_0_#00000026,0_2px_3px_#00000026]",
          "dark:hover:not-disabled:not-aria-disabled:not-data-disabled:from-[#404040] dark:hover:not-disabled:not-aria-disabled:not-data-disabled:to-[#333]",
          "active:bg-linear-to-t data-pressed:bg-linear-to-t aria-expanded:bg-linear-to-t",
          "active:shadow-[inset_0_-2px_0_#00000008] data-pressed:shadow-[inset_0_-2px_0_#00000008] aria-expanded:shadow-[inset_0_-2px_0_#00000008] dark:active:shadow-[inset_0_-2px_0_#00000026] dark:data-pressed:shadow-[inset_0_-2px_0_#00000026] dark:aria-expanded:shadow-[inset_0_-2px_0_#00000026]",
        ],
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive: [
          "border-red-700 bg-linear-to-b from-red-400 to-red-600 text-white transition-all! duration-300! focus-visible:border-destructive focus-visible:ring-destructive/30",
          "shadow-[inset_0_1px_0_#ffffffb3,inset_0_0_0_1px_#ffffff26,inset_0_-2px_0_#991b1b40,0_2px_3px_#dc262626]",
          "hover:not-disabled:not-aria-disabled:not-data-disabled:from-red-300 hover:not-disabled:not-aria-disabled:not-data-disabled:to-red-500",
          "dark:border-red-400 dark:from-red-400 dark:to-red-600 dark:shadow-[inset_0_1px_0_#ffffff66,inset_0_0_0_1px_#ffffff26,inset_0_-2px_0_#991b1b40,0_2px_3px_#00000040] dark:focus-visible:ring-destructive/40",
          "active:bg-linear-to-t data-pressed:bg-linear-to-t aria-expanded:bg-linear-to-t",
          "active:shadow-[inset_0_0_0_1px_#ffffff26,inset_0_-2px_0_#991b1b40] data-pressed:shadow-[inset_0_0_0_1px_#ffffff26,inset_0_-2px_0_#991b1b40] aria-expanded:shadow-[inset_0_0_0_1px_#ffffff26,inset_0_-2px_0_#991b1b40]",
        ],
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-7 gap-1 px-2 text-xs/relaxed has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        xs: "h-5 gap-1 rounded-sm px-2 text-[0.625rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-2.5",
        sm: "h-6 gap-1 px-2 text-xs/relaxed has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        lg: "h-8 gap-1 px-2.5 text-xs/relaxed has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-4",
        icon: "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-xs": "size-5 rounded-sm [&_svg:not([class*='size-'])]:size-2.5",
        "icon-sm": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-lg": "size-8 [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "primary",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
