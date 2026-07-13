type CareAreaViewProps = {
  title: string;
  badge: {
    text: string;
    variant: "green" | "yellow";
  };
  goal: string;
  measure?: string;
  target?: string;
};

export function CareAreaViewCard({
  title,
  badge,
  goal,
  measure,
  target,
}: CareAreaViewProps) {
  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            badge.variant === "green"
              ? "border border-green-200 bg-green-50 text-green-700"
              : "border border-yellow-200 bg-yellow-50 text-yellow-700"
          }`}
        >
          {badge.text}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-sm text-slate-700">
          <span className="font-semibold text-slate-700 mr-1">Goal:</span>
          {goal}
        </p>
      </div>

      <div className="flex items-center gap-6 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
        <div className="flex-1">
          <span className="font-semibold text-slate-700 block mb-1">Measure:</span>
          {measure || "Not specified"}
        </div>
        <div className="w-px h-8 bg-slate-200"></div>
        <div className="flex-1">
          <span className="font-semibold text-slate-700 block mb-1">Target Date:</span>
          {target || "Not specified"}
        </div>
      </div>
    </div>
  );
}
