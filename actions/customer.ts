
"use server";

import { db } from "@/db";
import { customers } from "@/db/schema";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

export async function createCustomer(data: { name: string; address?: string; gstin?: string; mobile?: string }) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    try {
        await db.insert(customers).values({
            name: data.name,
            address: data.address,
            gstin: data.gstin,
            mobile: data.mobile,
            userId: session.user.id,
        });

        // revalidatePath needed? Ideally revalidate the customers page
        return { success: true };
    } catch (error) {
        console.error("Failed to create customer:", error);
        return { error: "Failed to create customer" };
    }
}

export async function getCustomers() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return [];
    }

    try {
        const userCustomers = await db.select().from(customers).where(eq(customers.userId, session.user.id));
        return userCustomers;
    } catch (error) {
        console.error("Failed to fetch customers:", error);
        return [];
    }
}
