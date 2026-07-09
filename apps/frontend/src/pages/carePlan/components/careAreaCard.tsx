type CareAreaProps = {
  title: string;
  badge: {
    text: string;
    variant: "blue" | "gray";
  };
  goal: string;
  measure: string;
  target: string;
  tasks: string[];
};

export function CareAreaCard({
  title,
  badge,
  goal,
  measure,
  target,
  tasks,
}: CareAreaProps) {
  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              badge.variant === "blue"
                ? "bg-blue-100 text-blue-700"
                : "border border-slate-200 bg-slate-50 text-slate-600"
            }`}
          >
            {badge.text}
          </span>
        </div>
        <button className="text-sm font-medium text-slate-500 hover:text-slate-700">
          Remove
        </button>
      </div>

      <div className="mb-2">
        <span className="font-semibold text-slate-700">Goal:</span>
        <p className="mt-1 text-sm text-slate-700">{goal}</p>
      </div>

      <div className="mb-3 text-xs text-slate-500">
        Measure: {measure} <span className="mx-1">·</span> Target: {target}
      </div>

      <ul className="space-y-1">
        {tasks.map((task, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
            <span>{task}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
