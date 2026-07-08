import * as React from "react";
import { Plus, MoreHorizontal, Edit2 } from "lucide-react";
import { Card } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export interface TaskItem {
  id: number;
  done: boolean;
  title: string;
  description: string;
  frequency: string;
  status: "COMPLETED" | "PENDING" | "UPCOMING" | "OVERDUE";
  originalStatus: "COMPLETED" | "PENDING" | "UPCOMING" | "OVERDUE";
}

/**
 * InterventionsTable component displaying a list of nursing tasks and status toggling.
 */
export function InterventionsTable() {
  const [tasks, setTasks] = React.useState<TaskItem[]>([
    {
      id: 1,
      done: true,
      title: "Assist with morning bathing",
      description: "Partial assist of 1 required",
      frequency: "Daily (AM)",
      status: "COMPLETED",
      originalStatus: "COMPLETED",
    },
    {
      id: 2,
      done: false,
      title: "Transfer using gait belt",
      description: "Safety protocol for all out-of-bed activity",
      frequency: "Every Shift",
      status: "PENDING",
      originalStatus: "PENDING",
    },
    {
      id: 3,
      done: false,
      title: "Administer oral meds",
      description: "Crush meds and mix with applesauce",
      frequency: "09:00, 21:00",
      status: "UPCOMING",
      originalStatus: "UPCOMING",
    },
    {
      id: 4,
      done: false,
      title: "Repositioning",
      description: "Check skin integrity every 2 hours",
      frequency: "Every 2 hrs",
      status: "OVERDUE",
      originalStatus: "OVERDUE",
    },
  ]);

  /**
   * Toggles a task checked/unchecked state and updates status.
   *
   * @param id The ID of the task to toggle.
   */
  const toggleTask = (id: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id === id) {
          const nextDone = !t.done;
          return {
            ...t,
            done: nextDone,
            status: nextDone ? "COMPLETED" : t.originalStatus,
          };
        }
        return t;
      }),
    );
  };

  return (
    <Card className="border-brand-border flex flex-col justify-between overflow-hidden border bg-white text-left shadow-sm">
      {/* Header Section */}
      <div className="border-brand-border/60 flex items-center justify-between border-b p-6 pb-4">
        <h3 className="font-heading text-lg font-bold text-[#233955]">
          Interventions & Tasks
        </h3>
        <Button
          onClick={() => {
            alert("Add Task");
          }}
          className="text-brand-primary-dark border-brand-border flex cursor-pointer items-center gap-1 border bg-slate-50 px-3 py-1.5 text-xs font-bold tracking-wide hover:bg-slate-100"
        >
          <Plus className="h-4.5 w-4.5 stroke-[2.2]" />
          <span>Add Task</span>
        </Button>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-brand-border/60 text-brand-gray-muted border-b bg-slate-50/50 text-[10px] font-bold tracking-wider uppercase">
              <th className="w-16 px-6 py-3 text-center">Done</th>
              <th className="px-4 py-3 text-left">Intervention</th>
              <th className="px-4 py-3 text-left">Frequency</th>
              <th className="w-28 px-4 py-3 text-left">Status</th>
              <th className="w-16 px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-brand-border/40 divide-y">
            {tasks.map((task) => (
              <tr
                key={task.id}
                className={`transition-colors duration-100 ${
                  task.done
                    ? "text-brand-primary-dark/80 bg-slate-50/30"
                    : "hover:bg-slate-50/30"
                }`}
              >
                {/* Checkbox cell */}
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={task.done}
                      onCheckedChange={() => {
                        toggleTask(task.id);
                      }}
                    />
                  </div>
                </td>

                {/* Description cell */}
                <td className="px-4 py-4">
                  <div className="text-brand-primary-dark text-sm font-bold">
                    {task.title}
                  </div>
                  <div className="text-brand-gray-muted mt-0.5 max-w-sm text-xs leading-relaxed font-medium">
                    {task.description}
                  </div>
                </td>

                {/* Frequency cell */}
                <td className="px-4 py-4 text-sm font-semibold text-[#4b4d4f]">
                  {task.frequency}
                </td>

                {/* Status badge cell */}
                <td className="px-4 py-4">
                  {task.status === "COMPLETED" && (
                    <Badge
                      variant="priority"
                      className="text-brand-primary-dark rounded border-transparent bg-[#a2f2ee] text-[9px] font-bold tracking-wider uppercase hover:bg-[#a2f2ee]"
                    >
                      COMPLETED
                    </Badge>
                  )}
                  {task.status === "PENDING" && (
                    <Badge
                      variant="muted"
                      className="text-brand-primary-dark rounded border-transparent bg-[#e6e6e7] text-[9px] font-bold tracking-wider uppercase"
                    >
                      PENDING
                    </Badge>
                  )}
                  {task.status === "UPCOMING" && (
                    <Badge
                      variant="muted"
                      className="rounded border-transparent bg-[#e6e6e7]/80 text-[9px] font-bold tracking-wider text-[#87888a] uppercase"
                    >
                      UPCOMING
                    </Badge>
                  )}
                  {task.status === "OVERDUE" && (
                    <Badge
                      variant="warning"
                      className="bg-brand-alert-bg hover:bg-brand-alert-bg text-brand-alert-text rounded border-transparent text-[9px] font-bold tracking-wider uppercase"
                    >
                      OVERDUE
                    </Badge>
                  )}
                </td>

                {/* Actions cell */}
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        alert(`Edit: ${task.title}`);
                      }}
                      className="text-brand-primary-dark/70 hover:text-brand-primary-dark cursor-pointer rounded p-1.5 transition-colors hover:bg-slate-100"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        alert(`Menu: ${task.title}`);
                      }}
                      className="text-brand-primary-dark/70 hover:text-brand-primary-dark cursor-pointer rounded p-1.5 transition-colors hover:bg-slate-100"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-brand-border/60 border-t bg-slate-50/50 p-4 text-center">
        <button
          type="button"
          onClick={() => {
            alert("Loading all interventions...");
          }}
          className="text-brand-primary-dark cursor-pointer text-xs font-bold tracking-wide hover:underline"
        >
          Show All Interventions (12)
        </button>
      </div>
    </Card>
  );
}
