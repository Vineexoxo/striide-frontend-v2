import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

const buttonBaseLineStyles = [
    "active:scale-95",
    "inline-flex",
    "items-center",
    "justify-center",
    "rounded-md",
    "text-sm",
    "font-medium",
    "transition-colors",
    "focus:outline-none",
    "disabled:opacity-50",
    "disabled:pointer-events-none",
];

const buttonVariants = cva(
    buttonBaseLineStyles.join(",").replaceAll(",", " "),
    {
        variants: {
            variant: {
                default:
                    "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-100",
                destructive:
                    "text-white hover:bg-red-600 dark:hover:bg-red-600",
                outline:
                    "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-100 border border-slate-200 dark:border-slate-700",
                subtle: "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:text-slate-900",
                ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 data-[state=open]:bg-transparent dark:data-[state=open]:bg-transparent",
                link: "bg-transparent dark:bg-transparent underline-offset-4 hover:underline text-slate-900 dark:text-slate-100 hover:bg-transparent dark:hover:bg-transparent",
                login: "bg-black-hi-fi w-full h-[48px] rounded-md text-offwhite-hi-fi hover:bg-black-hi-fi/85",
                landing:
                    "bg-landing-primary w-full text-offwhite-hi-fi hover:bg-landing-primary/85 font-montserrat font-light text-[20px]",
            },
            size: {
                landing: "h-[56px] rounded-[16px]",
                mobile: "h-12 rounded-md",
                default: "h-10 py-2 px-4",
                sm: "h-9 px-2 rounded-md",
                lg: "h-11 px-8 rounded-md",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, children, variant, isLoading, size, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={isLoading}
                {...props}
            >
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {children}
            </button>
        );
    },
);
Button.displayName = "Button";

export { Button, buttonVariants };
