
import { AppHeader } from "@/components/app-header";

export default function FactoryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col">
            <AppHeader />
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}
