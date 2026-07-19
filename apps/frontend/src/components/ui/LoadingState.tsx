import { Loader2 } from "lucide-react";

export function LoadingState() {
    return (
        <div className="flex h-full min-h-[400px] flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium text-slate-500">Loading dashboard...</p>
        </div>
    );
}
