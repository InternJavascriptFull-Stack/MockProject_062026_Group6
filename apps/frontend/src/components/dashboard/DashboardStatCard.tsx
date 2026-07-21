import React from "react";

interface DashboardStatCardProps {
    title: string;
    value: React.ReactNode;
    icon: React.ReactNode;
    color: "yellow" | "blue" | "orange" | "red" | "green" | "purple";
}

const colorMap = {
    yellow: { bg: "bg-yellow-50", text: "text-yellow-600" },
    blue: { bg: "bg-blue-50", text: "text-blue-600" },
    orange: { bg: "bg-orange-50", text: "text-orange-600" },
    red: { bg: "bg-red-50", text: "text-red-500" },
    green: { bg: "bg-green-50", text: "text-green-500" },
    purple: { bg: "bg-purple-50", text: "text-purple-600" },
};

export function DashboardStatCard({ title, value, icon, color }: DashboardStatCardProps) {
    const theme = colorMap[color];

    return (
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${theme.bg}`}>
                {React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                    className: `h-6 w-6 ${theme.text}`,
                })}
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
            </div>
        </div>
    );
}
