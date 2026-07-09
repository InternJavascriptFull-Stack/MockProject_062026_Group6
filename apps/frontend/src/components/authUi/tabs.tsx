import { createContext, useContext, useMemo, useState, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

export function Tabs({
  defaultValue,
  onValueChange,
  className,
  ...props
}: ComponentProps<"div"> & {
  defaultValue: string;
  onValueChange?: (value: string) => void;
}) {
  const [value, setValueState] = useState(defaultValue);
  const contextValue = useMemo(
    () => ({
      value,
      setValue: (nextValue: string) => {
        setValueState(nextValue);
        onValueChange?.(nextValue);
      },
    }),
    [onValueChange, value],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn("flex flex-col gap-2", className)} {...props} />
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("inline-flex items-center", className)} {...props} />;
}

export function TabsTrigger({ value, className, ...props }: ComponentProps<"button"> & { value: string }) {
  const context = useContext(TabsContext);
  const active = context?.value === value;

  return (
    <button
      type="button"
      data-state={active ? "active" : "inactive"}
      onClick={() => context?.setValue(value)}
      className={cn("inline-flex items-center justify-center transition-colors", className)}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mt-2", className)} {...props} />;
}
