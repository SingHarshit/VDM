import React from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";// Adjust the import path accordingly

const buttonVariants = cva(
  "px-4 py-2 text-white font-semibold rounded-md transition-colors",
  {
    variants: {
      variant: {
        primary: "bg-blue-500 hover:bg-blue-600",
        secondary: "bg-gray-500 hover:bg-gray-600",
        link: "text-blue-500 underline",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button: React.FC<ButtonProps> = ({ variant, className, ...props }) => {
  return (
    <button className={cn(buttonVariants({ variant }), className)} {...props} />
  );
};

export default Button;
