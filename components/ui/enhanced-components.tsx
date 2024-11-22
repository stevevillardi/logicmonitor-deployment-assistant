import { Button as BaseButton } from "@/components/ui/button"
import { Input as BaseInput } from "@/components/ui/input"
import { forwardRef } from "react"

// Enhanced Button component
interface ButtonProps extends React.ComponentProps<"button"> {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "ghost";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  size?: "icon" | "sm" | "md" | "lg";
}

export const Button = forwardRef(({ className, variant = "default", ...props }: ButtonProps, ref) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "destructive":
        return "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
      case "outline":
        return "border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
      case "ghost":
        return "hover:bg-gray-50 text-gray-700"
      default:
        return "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
    }
  }

  return (
    <BaseButton
      ref={ref}
      className={`font-medium rounded-lg transition-all duration-200 ${getVariantStyles()} ${className}`}
      variant={variant}
      {...props}
    />
  )
})
Button.displayName = "Button"


interface InputProps extends React.ComponentProps<"input"> {
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string | number;
}

// Enhanced Input component
export const Input = forwardRef(({ className, ...props }: InputProps, ref) => {
  return (
    <BaseInput
      ref={ref}
      className={`h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
})
Input.displayName = "Input"

export default { Button, Input }