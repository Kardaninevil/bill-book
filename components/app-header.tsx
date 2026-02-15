
import Link from "next/link";
import { Building2 } from "lucide-react";
import { LoginButton } from "@/components/login-button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function AppHeader() {
    const session = await getServerSession(authOptions);

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="container mx-auto py-4 px-4 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-none">Radhekrishna</h1>
                        <span className="text-sm text-indigo-600 font-medium">Engineering</span>
                    </div>
                </Link>
                <div className="flex items-center gap-4">
                    {session?.user?.name && (
                        <div className="hidden md:block text-sm text-slate-500">
                            Welcome, {session.user.name}
                        </div>
                    )}
                    <LoginButton />
                </div>
            </div>
        </header>
    );
}
