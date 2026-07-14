import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectContextValue = {
  value: string;
  label: ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
  setSelected: (value: string, label: ReactNode) => void;
};

const SelectContext = createContext<SelectContextValue | null>(null);

export function Select({
  defaultValue = "",
  value: controlledValue,
  onValueChange,
  children,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
}) {
  const [value, setValue] = useState(defaultValue);
  const [label, setLabel] = useState<ReactNode>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (controlledValue !== undefined) {
      setValue(controlledValue);
    }
  }, [controlledValue]);

  const contextValue = useMemo(
    () => ({
      value,
      label,
      open,
      setOpen,
      setSelected: (nextValue: string, nextLabel: ReactNode) => {
        setValue(nextValue);
        setLabel(nextLabel);
        setOpen(false);
        onValueChange?.(nextValue);
      },
    }),
    [label, onValueChange, open, value],
  );

  return (
    <SelectContext.Provider value={contextValue}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className, children, ...props }: ComponentProps<"button">) {
  const context = useContext(SelectContext);

  return (
    <button
      type="button"
      aria-expanded={context?.open}
      onClick={() => context?.setOpen(!context.open)}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="h-4 w-4 text-slate-400" />
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const context = useContext(SelectContext);
  return <span>{context?.label || context?.value || placeholder}</span>;
}

export function SelectContent({ className, children, ...props }: ComponentProps<"div">) {
  const context = useContext(SelectContext);

  if (!context?.open) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-md border border-slate-200 bg-white p-1 shadow-xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SelectItem({ value, children, className, ...props }: ComponentProps<"button"> & { value: string }) {
  const context = useContext(SelectContext);

  return (
    <button
      type="button"
      className={cn(
        "block w-full rounded px-3 py-2 text-left text-sm hover:bg-slate-100",
        context?.value === value && "bg-slate-100 font-semibold",
        className,
      )}
      onClick={() => context?.setSelected(value, children)}
      {...props}
    >
      {children}
    </button>
  );
}

export function SelectGroup({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-1", className)} {...props} />;
}

export function SelectLabel({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("px-3 py-1 text-xs font-medium text-slate-500", className)} {...props} />;
}

export function SelectSeparator({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("my-1 h-px bg-slate-100", className)} {...props} />;
}

export function SelectScrollDownButton() {
  return null;
}

export function SelectScrollUpButton() {
  return null;
}
