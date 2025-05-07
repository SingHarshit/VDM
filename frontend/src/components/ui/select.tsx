import * as React from "react";
import { Check, ChevronDown} from "lucide-react";
import { cn } from "../../lib/utils";

const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={cn(
      "w-full p-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring",
      props.className
    )}
  >
    {children}
  </select>
);

const SelectTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between border border-input rounded-md px-3 py-2 bg-background text-sm",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
    </div>
  )
);
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder }: { placeholder?: string }) => (
  <span className="text-muted-foreground text-sm truncate">
    {placeholder || "Select an option"}
  </span>
);

const SelectContent = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-1 border border-input rounded-md bg-popover shadow-md p-1 space-y-1">
    {children}
  </div>
);

const SelectItem = ({ children, value }: { children: React.ReactNode; value: string }) => (
  <option value={value} className="px-2 py-1 hover:bg-accent rounded-sm">
    {children}
  </option>
);

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
