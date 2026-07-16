import React from "react";

interface FormFieldProps {
    id: string;
    label: string;
    error?: string;
    hint?: string;
    children: React.ReactElement;
}

/**
 * Accessible form field wrapper used across auth screens.
 * Links label → input via htmlFor/id, and wires aria-describedby
 * to the error message when present.
 */
export function FormField({ id, label, error, hint, children }: FormFieldProps) {
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;

    const child = React.cloneElement(children, {
        id,
        "aria-describedby": describedBy || undefined,
        "aria-invalid": error ? ("true" as const) : undefined,
    });

    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-xs font-bold text-slate-700">
                {label}
            </label>
            {child}
            {error && (
                <span id={errorId} role="alert" className="mt-1 text-[10px] font-semibold text-red-500">
                    {error}
                </span>
            )}
            {hint && !error && (
                <span id={hintId} className="mt-1 text-[10px] font-medium text-slate-400">
                    {hint}
                </span>
            )}
        </div>
    );
}
