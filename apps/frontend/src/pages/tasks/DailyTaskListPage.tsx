import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { careTasksService } from "../../services/careTasks";
import { EmptyState, LoadingState, Notice, Panel, PrimaryButton, SecondaryButton, StatusBadge, WorkflowPage } from "../../components/workflow/WorkflowUi";

export default function DailyTaskListPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [status, setStatus] = useState("ALL");
    const query = useQuery({ queryKey: ["care-tasks-today", status], queryFn: () => careTasksService.getToday({ status }) });
    const completeMutation = useMutation({
        mutationFn: (id: string) => careTasksService.complete(id, {}),
        onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["care-tasks-today"] }),
    });

    return (
        <WorkflowPage breadcrumb="Care Planning  >  Daily Tasks" title="Daily Task List" description="Current-shift care tasks ordered by due time.">
            {completeMutation.error && (
                <div className="mb-4">
                    <Notice type="error">{String(completeMutation.error)}</Notice>
                </div>
            )}
            <Panel
                title="Task Filters"
                actions={
                    <div className="flex flex-wrap gap-2">
                        {["ALL", "PENDING", "IN_PROGRESS", "COMPLETED"].map((item) => (
                            <button
                                key={item}
                                onClick={() => setStatus(item)}
                                className={`rounded-full px-3 py-1.5 text-xs font-bold ${status === item ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}
                            >
                                {item.replaceAll("_", " ")}
                            </button>
                        ))}
                    </div>
                }
            >
                {query.isLoading ? (
                    <LoadingState />
                ) : !query.data?.length ? (
                    <EmptyState label="No care tasks match the selected filter for today." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                <tr>
                                    <th className="px-4 py-3">Resident</th>
                                    <th className="px-4 py-3">Room</th>
                                    <th className="px-4 py-3">Task</th>
                                    <th className="px-4 py-3">Due Time</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {query.data.map((task) => (
                                    <tr key={task.id}>
                                        <td className="px-4 py-4 font-semibold">{task.resident?.fullName ?? "Unknown resident"}</td>
                                        <td className="px-4 py-4">{task.resident?.roomNumber ?? "—"}</td>
                                        <td className="px-4 py-4">
                                            <span className="font-medium">{task.taskType}</span>
                                            <span className="block text-xs text-slate-500">{task.intervention?.description}</span>
                                        </td>
                                        <td className="px-4 py-4">{new Date(task.scheduledTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                                        <td className="px-4 py-4">
                                            <StatusBadge tone={task.status === "COMPLETED" ? "success" : task.abnormal ? "danger" : "warning"}>{task.status}</StatusBadge>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {task.taskType.toLowerCase().includes("vital") && task.resident && (
                                                    <PrimaryButton onClick={() => navigate(`/care-tasks/${task.id}/vitals?residentId=${task.resident!.id}`)}>
                                                        Record Vitals
                                                    </PrimaryButton>
                                                )}
                                                {task.status !== "COMPLETED" && !task.taskType.toLowerCase().includes("vital") && (
                                                    <SecondaryButton disabled={completeMutation.isPending} onClick={() => completeMutation.mutate(task.id)}>
                                                        Complete
                                                    </SecondaryButton>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Panel>
        </WorkflowPage>
    );
}
