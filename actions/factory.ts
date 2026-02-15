
"use server";

import { db } from "@/db";
import { factories } from "@/db/schema";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

export async function createFactory(data: { name: string; address: string; gstin?: string }) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    try {
        await db.insert(factories).values({
            name: data.name,
            address: data.address,
            gstin: data.gstin,
            userId: session.user.id,
        });

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Failed to create factory:", error);
        return { error: "Failed to create factory" };
    }
}

export async function getFactories() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return [];
    }

    try {
        const userFactories = await db.select().from(factories).where(eq(factories.userId, session.user.id));
        return userFactories;
    } catch (error) {
        console.error("Failed to fetch factories:", error);
        return [];
    }
}

export async function getFactory(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;

    try {
        const factory = await db.query.factories.findFirst({
            where: and(eq(factories.id, id), eq(factories.userId, session.user.id)),
        });
        return factory;
    } catch (error) {
        console.error("Failed to fetch factory:", error);
        return null;
    }
}

export async function deleteFactory(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        await db.delete(factories).where(and(eq(factories.id, id), eq(factories.userId, session.user.id)));
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete factory:", error);
        return { error: "Failed to delete factory" };
    }
}
