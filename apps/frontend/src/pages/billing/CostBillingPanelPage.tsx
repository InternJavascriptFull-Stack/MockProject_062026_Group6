import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { billingService } from "../../services/billing";
import { residentsService } from "../../services/residents";
import { fieldClassName, labelClassName, LoadingState, Notice, Panel, PrimaryButton, StatusBadge, WorkflowPage } from "../../components/workflow/WorkflowUi";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function CostBillingPanelPage() {
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const residentsQuery = useQuery({ queryKey: ["resident-options"], queryFn: () => residentsService.getAll() });
    const [residentId, setResidentId] = useState(searchParams.get("residentId") ?? "");
    useEffect(() => {
        if (!residentId && residentsQuery.data?.[0]) setResidentId(residentsQuery.data[0].id);
    }, [residentId, residentsQuery.data]);
    const billingQuery = useQuery({ queryKey: ["billing-cost", residentId], queryFn: () => billingService.getResidentCost(residentId), enabled: Boolean(residentId) });
    const [rate, setRate] = useState(0);
    const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().slice(0, 10));
    const [message, setMessage] = useState<string | null>(null);
    useEffect(() => {
        if (billingQuery.data) setRate(billingQuery.data.dailyRate);
    }, [billingQuery.data]);
    const mutation = useMutation({
        mutationFn: () => billingService.updateRate(residentId, billingQuery.data.activeLoc.id, { dailyRate: rate, effectiveFrom }),
        onSuccess: async () => {
            setMessage("The new rate was saved and applies only to future invoice cycles.");
            await queryClient.invalidateQueries({ queryKey: ["billing-cost", residentId] });
        },
    });
    const data = billingQuery.data;
    return (
        <WorkflowPage
            breadcrumb="Billing  >  Resident Cost Panel"
            title="Cost & Billing Panel"
            description="Review payer splits, active LOC pricing, invoice details, and future-effective rate changes."
        >
            <Panel title="Resident">
                <label className={labelClassName}>
                    Resident
                    <select className={fieldClassName} value={residentId} onChange={(event) => setResidentId(event.target.value)}>
                        {residentsQuery.data?.map((resident) => (
                            <option key={resident.id} value={resident.id}>
                                {resident.fullName}
                            </option>
                        ))}
                    </select>
                </label>
            </Panel>
            {message && (
                <div className="mt-4">
                    <Notice type="success">{message}</Notice>
                </div>
            )}
            {(billingQuery.error || mutation.error) && (
                <div className="mt-4">
                    <Notice type="error">{String(billingQuery.error ?? mutation.error)}</Notice>
                </div>
            )}
            <div className="mt-5">
                {billingQuery.isLoading || !data ? (
                    <Panel>
                        <LoadingState />
                    </Panel>
                ) : (
                    <div className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-4">
                            <Panel title="Active LOC">
                                <StatusBadge tone={data.activeLoc ? "success" : "warning"}>{data.activeLoc?.name ?? "Not confirmed"}</StatusBadge>
                                <p className="mt-2 text-xs text-slate-500">Since {data.activeLoc?.startDate ?? "—"}</p>
                            </Panel>
                            <Panel title="Daily Rate">
                                <p className="text-2xl font-bold text-slate-900">{money.format(data.dailyRate)}</p>
                            </Panel>
                            <Panel title="Monthly Estimate">
                                <p className="text-2xl font-bold text-slate-900">{money.format(data.monthlyEstimate)}</p>
                            </Panel>
                            <Panel title="Invoice Status">
                                <StatusBadge tone={data.status === "PAID" ? "success" : "info"}>{data.status}</StatusBadge>
                            </Panel>
                        </div>
                        <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
                            <Panel title="Payer Breakdown">
                                <div className="space-y-4">
                                    {Object.entries(data.payerBreakdown).map(([payer, amount]) => {
                                        const percentage = data.total ? Math.round((Number(amount) / data.total) * 100) : 0;
                                        return (
                                            <div key={payer}>
                                                <div className="mb-1 flex justify-between text-sm">
                                                    <span className="font-medium text-slate-700 capitalize">{payer.replace(/([A-Z])/g, " $1")}</span>
                                                    <strong>
                                                        {money.format(Number(amount))} · {percentage}%
                                                    </strong>
                                                </div>
                                                <div className="h-2 rounded-full bg-slate-100">
                                                    <div className="h-2 rounded-full bg-blue-600" style={{ width: `${percentage}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div className="flex justify-between border-t pt-4 text-lg">
                                        <strong>Total</strong>
                                        <strong>{money.format(data.total)}</strong>
                                    </div>
                                </div>
                            </Panel>
                            <Panel title="Future Rate Change" description="Historical invoices are never recalculated.">
                                <label className={labelClassName}>
                                    Daily Rate
                                    <input className={fieldClassName} type="number" min={0} step="0.01" value={rate} onChange={(event) => setRate(Number(event.target.value))} />
                                </label>
                                <label className={`${labelClassName} mt-4 block`}>
                                    Effective From
                                    <input className={fieldClassName} type="date" value={effectiveFrom} onChange={(event) => setEffectiveFrom(event.target.value)} />
                                </label>
                                <PrimaryButton className="mt-5 w-full" disabled={!data.activeLoc || mutation.isPending} onClick={() => mutation.mutate()}>
                                    {mutation.isPending ? "Saving..." : "Save Future Rate"}
                                </PrimaryButton>
                            </Panel>
                        </div>
                        <Panel title="Rate History">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                        <tr>
                                            <th className="px-4 py-3">Daily Rate</th>
                                            <th className="px-4 py-3">Effective From</th>
                                            <th className="px-4 py-3">Effective To</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.rateHistory.map((item: any) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-4 font-semibold">{money.format(item.dailyRate)}</td>
                                                <td className="px-4 py-4">{item.effectiveFrom}</td>
                                                <td className="px-4 py-4">{item.effectiveTo ?? "Current"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Panel>
                    </div>
                )}
            </div>
        </WorkflowPage>
    );
}
