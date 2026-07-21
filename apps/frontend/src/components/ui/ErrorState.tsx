import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
}

export function ErrorState({ message = "An error occurred while loading the dashboard.", onRetry }: ErrorStateProps) {
    return (
        <div className="flex h-full min-h-[400px] flex-col items-center justify-center space-y-4 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-900">Failed to load</h3>
                <p className="text-sm text-slate-500">{message}</p>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-4 rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                    type="button"
                >
                    Try again
                </button>
            )}
        </div>
    );
}
