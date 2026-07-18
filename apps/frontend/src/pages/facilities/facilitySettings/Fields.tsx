import { Input } from "@/components/authUi/input";

export function TextField({
    label,
    value,
    onChange,
    readOnly = false,
    maxLength,
    error,
}: {
    label: string;
    value: string;
    onChange?: (value: string) => void;
    readOnly?: boolean;
    maxLength?: number;
    error?: string;
}) {
    return (
        <label className="space-y-2 text-sm">
            <span className="font-bold text-slate-600">{label}</span>
            <Input
                value={value}
                readOnly={readOnly}
                disabled={readOnly}
                maxLength={maxLength}
                onChange={(event) => onChange?.(event.target.value)}
            />
            {error && <span className="block text-xs font-semibold text-red-600">{error}</span>}
        </label>
    );
}

export function SelectField({
    label,
    value,
    options,
    onChange,
    error,
}: {
    label: string;
    value: string;
    options: Array<{ label: string; value: string }>;
    onChange: (value: string) => void;
    error?: string;
}) {
    return (
        <label className="space-y-2 text-sm">
            <span className="font-bold text-slate-600">{label}</span>
            <select
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={value}
                onChange={(event) => onChange(event.target.value)}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <span className="block text-xs font-semibold text-red-600">{error}</span>}
        </label>
    );
}
