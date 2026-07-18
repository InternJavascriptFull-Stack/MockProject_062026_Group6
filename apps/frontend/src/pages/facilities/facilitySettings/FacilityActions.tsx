import { Button } from "@/components/ui/button";

export function FacilityActions({
    isSaving,
    cannotSave,
    onCancel,
    onSave,
}: {
    isSaving: boolean;
    cannotSave: boolean;
    onCancel: () => void;
    onSave: () => void;
}) {
    return (
        <div className="fixed bottom-0 left-[260px] right-0 z-10 flex justify-end gap-3 border-t border-slate-200 bg-white px-8 py-4">
            <Button variant="outline" className="h-11 w-36 rounded-md" onClick={onCancel}>
                Cancel
            </Button>
            <Button className="h-11 w-72 rounded-md bg-blue-600 text-white hover:bg-blue-700" onClick={onSave} disabled={isSaving || cannotSave}>
                {isSaving ? "Saving..." : "Save Changes"}
            </Button>
        </div>
    );
}
