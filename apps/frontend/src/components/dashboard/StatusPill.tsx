import React from "react";

interface StatusPillProps {
    status: string;
    type?: "success" | "warning" | "error" | "neutral";
}

export function StatusPill({ status, type = "neutral" }: StatusPillProps) {
    let classes = "border-slate-200 bg-slate-100 text-slate-700";

    if (type === "success") {
        classes = "border-green-200 bg-green-50 text-green-700";
    } else if (type === "warning") {
        classes = "border-yellow-200 bg-yellow-50 text-yellow-700";
    } else if (type === "error") {
        classes = "border-red-200 bg-red-50 text-red-700";
    }

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${classes}`}>
            {status}
        </span>
    );
}
