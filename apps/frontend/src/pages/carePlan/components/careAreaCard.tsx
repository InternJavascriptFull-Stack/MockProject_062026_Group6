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
  onRemove?: () => void;
  onChange?: (field: string, value: any) => void;
};

export function CareAreaCard({
  title,
  badge,
  goal,
  measure,
  target,
  tasks,
  onRemove,
  onChange
}: CareAreaProps) {
  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-slate-900">
            {onChange ? (
              <input 
                type="text" 
                value={title} 
                onChange={e => onChange("title", e.target.value)}
                placeholder="Care Area Title..."
                className="border-b border-dashed border-slate-300 bg-transparent outline-none focus:border-blue-500" 
              />
            ) : title}
          </h3>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
              badge.variant === "blue"
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-slate-50 text-slate-600"
            }`}
          >
            {badge.text}
          </span>
        </div>
        {onRemove && (
          <button onClick={onRemove} className="text-slate-400 hover:text-red-500 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      <div className="mb-4 space-y-3">
        <div>
          <span className="font-semibold text-slate-700 text-sm">Goal: </span>
          {onChange ? (
            <input 
              type="text" 
              value={goal} 
              onChange={e => onChange("goal", e.target.value)}
              placeholder="Enter goal..."
              className="w-full border-b border-dashed border-slate-300 bg-transparent outline-none focus:border-blue-500 text-sm" 
            />
          ) : (
            <span className="text-sm text-slate-600">{goal}</span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-6 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
        <div className="flex-1">
          <span className="font-semibold text-slate-700 block mb-1">Measure:</span>
          {onChange ? (
            <input 
              type="text" 
              value={measure} 
              onChange={e => onChange("measure", e.target.value)}
              placeholder="How to measure..."
              className="w-full border-b border-dashed border-slate-300 bg-transparent outline-none focus:border-blue-500" 
            />
          ) : measure}
        </div>
        <div className="w-px h-8 bg-slate-200"></div>
        <div className="flex-1">
          <span className="font-semibold text-slate-700 block mb-1">Target Date:</span>
          {onChange ? (
            <input type="date" value={target} onChange={e => onChange("target", e.target.value)} className="w-full border-b border-dashed border-slate-300 bg-transparent outline-none focus:border-blue-500" />
          ) : target}
        </div>
      </div>
    </div>
  );
}
