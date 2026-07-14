import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";

export const fieldClassName =
    "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100";

export const labelClassName = "text-sm font-semibold text-slate-700";

export function WorkflowPage({
    title,
    description,
    breadcrumb,
    actions,
    children,
}: {
    title: string;
    description?: string;
    breadcrumb?: string;
    actions?: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="min-h-full bg-slate-50 px-6 py-7 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        {breadcrumb && <p className="mb-1 text-sm font-medium text-slate-500">{breadcrumb}</p>}
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">{title}</h1>
                        {description && <p className="mt-1 max-w-3xl text-sm text-slate-500">{description}</p>}
                    </div>
                    {actions}
                </div>
                {children}
            </div>
        </div>
    );
}

export function Panel({
    title,
    description,
    children,
    className = "",
    actions,
}: {
    title?: string;
    description?: string;
    children: ReactNode;
    className?: string;
    actions?: ReactNode;
}) {
    return (
        <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
            {(title || description || actions) && (
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
                    <div>
                        {title && <h2 className="font-bold text-slate-900">{title}</h2>}
                        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
                    </div>
                    {actions}
                </div>
            )}
            <div className="p-5">{children}</div>
        </section>
    );
}

export function PrimaryButton({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={`rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 ${className}`}
        >
            {children}
        </button>
    );
}

export function SecondaryButton({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={`rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400 ${className}`}
        >
            {children}
        </button>
    );
}

export function Notice({ type, children }: { type: "success" | "error" | "info" | "warning"; children: ReactNode }) {
    const styles = {
        success: "border-emerald-200 bg-emerald-50 text-emerald-800",
        error: "border-red-200 bg-red-50 text-red-700",
        info: "border-blue-200 bg-blue-50 text-blue-800",
        warning: "border-amber-200 bg-amber-50 text-amber-800",
    };
    return (
        <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${styles[type]}`}>
            {type === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
            <div>{children}</div>
        </div>
    );
}

export function LoadingState({ label = "Loading data..." }: { label?: string }) {
    return (
        <div className="flex min-h-48 items-center justify-center gap-3 text-sm font-medium text-slate-500">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            {label}
        </div>
    );
}

export function EmptyState({ label }: { label: string }) {
    return <div className="rounded-lg border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500">{label}</div>;
}

export function StatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "success" | "warning" | "danger" | "info" | "neutral" }) {
    const styles = {
        success: "border-emerald-200 bg-emerald-50 text-emerald-700",
        warning: "border-amber-200 bg-amber-50 text-amber-700",
        danger: "border-red-200 bg-red-50 text-red-700",
        info: "border-blue-200 bg-blue-50 text-blue-700",
        neutral: "border-slate-200 bg-slate-100 text-slate-600",
    };
    return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${styles[tone]}`}>{children}</span>;
}
