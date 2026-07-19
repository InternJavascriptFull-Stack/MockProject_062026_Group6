import React from "react";
import { Link } from "react-router-dom";

interface DashboardSectionProps {
    title: string;
    linkText?: string;
    linkTo?: string;
    badge?: React.ReactNode;
    children: React.ReactNode;
}

export function DashboardSection({ title, linkText, linkTo, badge, children }: DashboardSectionProps) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <h3 className="font-bold text-slate-900">{title}</h3>
                {badge && <div>{badge}</div>}
                {linkText && linkTo && (
                    <Link to={linkTo} className="text-sm font-medium text-blue-600 hover:underline">
                        {linkText}
                    </Link>
                )}
            </div>
            {children}
        </div>
    );
}
