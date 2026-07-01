import { ArrowRight, Clock3, FileText, ShieldCheck } from "lucide-react";

interface ModulePlaceholderPageProps {
    title: string;
    description: string;
}

const readinessCards = [
    {
        label: "Workflow",
        value: "Ready for design",
        icon: FileText,
    },
    {
        label: "Access",
        value: "Role-based",
        icon: ShieldCheck,
    },
    {
        label: "Status",
        value: "Coming soon",
        icon: Clock3,
    },
];

export function ModulePlaceholderPage({ title, description }: ModulePlaceholderPageProps) {
    return (
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <section className="border-brand-border rounded-lg border bg-white p-6 shadow-sm">
                <span className="text-xs font-bold tracking-[0.14em] text-teal-700 uppercase">WellNest Module</span>
                <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                        <h1 className="font-heading text-brand-primary-dark text-3xl font-bold">{title}</h1>
                        <p className="text-brand-gray-muted mt-3 text-sm leading-6 sm:text-base">{description}</p>
                    </div>
                    <button
                        type="button"
                        className="bg-brand-primary-dark inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
                    >
                        Review module scope
                        <ArrowRight size={16} />
                    </button>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3" aria-label={`${title} readiness`}>
                {readinessCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <article key={card.label} className="border-brand-border rounded-lg border bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-brand-gray-muted text-sm font-semibold">{card.label}</span>
                                <span className="bg-brand-primary-light text-brand-primary-dark grid h-9 w-9 place-items-center rounded-md">
                                    <Icon size={17} />
                                </span>
                            </div>
                            <strong className="text-brand-primary-dark mt-4 block text-xl font-bold">{card.value}</strong>
                        </article>
                    );
                })}
            </section>

            <section className="rounded-lg border border-dashed border-teal-200 bg-teal-50/60 p-6 text-sm leading-6 text-slate-600">
                This placeholder keeps navigation complete while the detailed workflow, data model, and backend integration are implemented in a later module task.
            </section>
        </main>
    );
}
