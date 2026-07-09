type CareAreaViewProps = {
  title: string;
  badge: {
    text: string;
    variant: "green" | "yellow";
  };
  goal: string;
  tasks: string[];
};

export function CareAreaViewCard({
  title,
  badge,
  goal,
  tasks,
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
