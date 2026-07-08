import * as React from "react";
import { ClipboardCheck, AlertCircle, Users, ExternalLink } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

interface TaskItem {
  id: string;
  residentName: string;
  room: string;
  taskName: string;
  dueTime: string;
  status: "Done" | "Missed" | "Pending";
}

const INITIAL_TASKS: TaskItem[] = [
  {
    id: "1",
    residentName: "Susan Wright",
    room: "114B",
    taskName: "Bedside Vitals",
    dueTime: "08:00 AM",
    status: "Done",
  },
  {
    id: "2",
    residentName: "James Porter",
    room: "210B",
    taskName: "Repositioning (2h)",
    dueTime: "08:30 AM",
    status: "Done",
  },
  {
    id: "3",
    residentName: "Robert Hayes",
    room: "204B",
    taskName: "Bathing Assistance",
    dueTime: "09:15 AM",
    status: "Missed",
  },
  {
    id: "4",
    residentName: "David Nguyen",
    room: "222A",
    taskName: "Bedside Vitals — abnormal SpO2 flagged",
    dueTime: "10:00 AM",
    status: "Done",
  },
  {
    id: "5",
    residentName: "Mary Coleman",
    room: "118A",
    taskName: "Ambulation Assist",
    dueTime: "11:00 AM",
    status: "Pending",
  },
];

export function CnaDashboard() {
  const [tasks, setTasks] = React.useState<TaskItem[]>(INITIAL_TASKS);

  // Toggle status to show micro-interactions
  const handleToggleStatus = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id === id) {
          const nextStatusMap: Record<TaskItem["status"], TaskItem["status"]> =
            {
              Pending: "Done",
              Done: "Missed",
              Missed: "Pending",
            };
          return { ...t, status: nextStatusMap[t.status] };
        }
        return t;
      }),
    );
  };

  const doneCount = tasks.filter((t) => t.status === "Done").length;
  const totalCount = tasks.length;
  const abnormalFlags = 1;
  const assignedResidents = 8;

  return (
    <main className="flex-1 space-y-6 p-6 md:p-8">
      {/* Title Header */}
      <div>
        <div className="text-brand-gray-muted text-xs font-bold tracking-wider uppercase">
          Dashboard
        </div>
        <h1 className="font-heading text-brand-primary-dark mt-0.5 text-3xl font-extrabold tracking-tight">
          Good morning, Marcus
        </h1>
        <p className="text-brand-gray-muted mt-1 text-sm font-medium">
          Day shift · 7:00 AM – 3:00 PM · Wing B
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Today's Tasks */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-brand-gray-muted text-xs font-bold tracking-wider uppercase">
                Today's Tasks
              </div>
              <div className="font-heading text-brand-primary-dark mt-1 text-2xl font-extrabold">
                {doneCount + 7} / {totalCount + 9}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Abnormal Flags Reported */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <div className="text-brand-gray-muted text-xs font-bold tracking-wider uppercase">
                Abnormal Flags Reported
              </div>
              <div className="font-heading text-brand-primary-dark mt-1 text-2xl font-extrabold">
                {abnormalFlags}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Residents */}
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="text-brand-gray-muted text-xs font-bold tracking-wider uppercase">
                Assigned Residents
              </div>
              <div className="font-heading text-brand-primary-dark mt-1 text-2xl font-extrabold">
                {assignedResidents}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shift Info Bar */}
      <Card className="bg-white">
        <CardContent className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div>
            <div className="text-brand-gray-muted text-xs font-bold tracking-wider uppercase">
              Shift Info
            </div>
            <div className="text-brand-primary-dark mt-1 text-base font-bold md:text-lg">
              Day Shift · Wing B · Rooms 106-124
            </div>
          </div>
          <div className="text-brand-primary-dark font-heading text-right text-base font-extrabold md:text-lg">
            7:00 AM – 3:00 PM
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Tasks Table */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between border-b pb-4">
            <h2 className="font-heading text-brand-primary-dark text-lg font-bold">
              Upcoming Tasks
            </h2>
            <button
              onClick={() => {
                alert("Redirecting to Daily Task List...");
              }}
              className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Go to Daily Task List <ExternalLink className="h-3 w-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b text-xs font-bold tracking-wider text-slate-400 uppercase">
                  <th className="pr-4 pb-3">Resident</th>
                  <th className="px-4 pb-3">Task</th>
                  <th className="px-4 pb-3">Due</th>
                  <th className="pb-3 pl-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="transition-colors hover:bg-slate-50/50"
                  >
                    <td className="text-brand-primary-dark py-4 pr-4 font-bold">
                      {task.residentName} ·{" "}
                      <span className="font-semibold text-slate-400">
                        {task.room}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-600">
                      {task.taskName}
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-500">
                      {task.dueTime}
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <button
                        onClick={() => {
                          handleToggleStatus(task.id);
                        }}
                        className="cursor-pointer transition-transform focus:outline-none active:scale-95"
                        title="Click to toggle status"
                      >
                        <Badge
                          variant={
                            task.status === "Done"
                              ? "priority"
                              : task.status === "Missed"
                                ? "alert"
                                : "muted"
                          }
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            task.status === "Done"
                              ? "border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : task.status === "Missed"
                                ? "border-transparent bg-red-100 text-red-700 hover:bg-red-200"
                                : "border-transparent bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {task.status}
                        </Badge>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
