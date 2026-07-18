import type React from "react";

export function SummaryCard({
    title,
    tag,
    children,
    className = "",
}: {
    title: string;
    tag: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section className={`rounded-lg border border-slate-200 bg-white p-5 ${className}`}>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">{tag}</span>
            </div>
            {children}
        </section>
    );
}

export function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="mb-3 flex items-start justify-between gap-4 text-sm">
            <span className="text-slate-500">{label}</span>
            <span className="text-right font-bold text-slate-700">{value}</span>
        </div>
    );
}
