import { CheckCircle2, Circle } from "lucide-react";

type TimelineEvent = {
  title: string;
  author: string;
  date: string;
  isSolid: boolean;
};

export function ActivityTimeline({ tasks = [] }: { tasks?: any[] }) {
  // If tasks are passed, use them. Otherwise, fall back to some mock history.
  const events: TimelineEvent[] = tasks.length > 0 
    ? tasks.map(t => ({
        title: `Task assigned: ${t.task || t.description}`,
        author: t.owner || t.assignedRole || "Anna Lee, RN",
        date: new Date().toLocaleDateString() + " 15:02",
        isSolid: false,
      }))
    : [
        {
          title: "Care plan created",
          author: "Anna Lee, RN",
          date: "2026-04-07 15:02",
          isSolid: false,
        }
      ];

  // Add the creation event if we used real tasks
  if (tasks.length > 0) {
    events.push({
      title: "Care plan created",
      author: "Anna Lee, RN",
      date: new Date().toLocaleDateString() + " 15:00",
      isSolid: true,
    });
  }

  return (
    <div className="mt-8">
      <h3 className="mb-6 font-bold text-slate-900">Activity (Care Activity Timeline)</h3>
      <div className="relative pl-3">
        {/* Vertical line */}
        <div className="absolute bottom-4 left-[15px] top-4 w-px bg-slate-200" />

        <div className="space-y-6">
          {events.map((event, idx) => (
            <div key={idx} className="relative flex gap-4">
              <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center bg-white">
                {event.isSolid ? (
                  <div className="h-3 w-3 rounded-full bg-blue-500 ring-4 ring-white" />
                ) : (
                  <div className="h-3 w-3 rounded-full border-2 border-blue-500 bg-white ring-4 ring-white" />
                )}
              </div>
              <div className="pt-0.5">
                <p className="text-sm font-bold text-slate-900">{event.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {event.author} <span className="mx-1">·</span> {event.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
