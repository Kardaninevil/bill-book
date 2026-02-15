
"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LoginButton() {
    const { data: session } = useSession();

    if (session) {
        return (
            <Button onClick={() => signOut()} variant="outline" className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
            </Button>
        );
    }

    return (
        <Button onClick={() => signIn("google")}>
            Sign in with Google
        </Button>
    );
}
