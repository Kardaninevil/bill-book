
"use server";

import { db } from "@/db";
import { invoices, invoiceItems } from "@/db/schema";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

interface InvoiceData {
    factoryId: string;
    invoiceNo: string;
    date: Date;
    customerName: string;
    customerAddress?: string;
    customerMobile?: string;
    customerGstin?: string;
    items: {
        name: string;
        quantity: number;
        rate: number;
        amount: number;
    }[];
    subTotal: number;
    gstRate: number;
    gstAmount: number;
    totalAmount: number;
}

export async function createInvoice(data: InvoiceData) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    try {
        const invoiceId = crypto.randomUUID();

        // Transaction? Drizzle generic sqlite doesn't support complex transactions easily without `db.transaction`.
        // We will do it sequentially for now.

        await db.insert(invoices).values({
            id: invoiceId,
            factoryId: data.factoryId,
            userId: session.user.id,
            invoiceNo: data.invoiceNo,
            date: data.date,
            customerName: data.customerName,
            customerAddress: data.customerAddress,
            customerMobile: data.customerMobile,
            customerGstin: data.customerGstin,
            subTotal: data.subTotal,
            gstRate: data.gstRate,
            gstAmount: data.gstAmount,
            totalAmount: data.totalAmount,
            status: "PAID",
        });

        if (data.items.length > 0) {
            await db.insert(invoiceItems).values(
                data.items.map((item) => ({
                    invoiceId: invoiceId,
                    name: item.name,
                    quantity: item.quantity,
                    rate: item.rate,
                    amount: item.amount,
                }))
            );
        }

        revalidatePath(`/factory/${data.factoryId}`);
        return { success: true, invoiceId };
    } catch (error) {
        console.error("Failed to create invoice:", error);
        return { error: "Failed to create invoice" };
    }
}



export async function updateInvoice(data: InvoiceData & { id: string }) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    try {
        await db.update(invoices).set({
            invoiceNo: data.invoiceNo,
            date: data.date,
            customerName: data.customerName,
            customerAddress: data.customerAddress,
            customerMobile: data.customerMobile,
            customerGstin: data.customerGstin,
            subTotal: data.subTotal,
            gstRate: data.gstRate,
            gstAmount: data.gstAmount,
            totalAmount: data.totalAmount,
            status: "PAID",
            updatedAt: new Date(),
        }).where(eq(invoices.id, data.id));

        // Replace items: Delete all old items and insert new ones
        await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, data.id));

        if (data.items.length > 0) {
            await db.insert(invoiceItems).values(
                data.items.map((item) => ({
                    invoiceId: data.id,
                    name: item.name,
                    quantity: item.quantity,
                    rate: item.rate,
                    amount: item.amount,
                }))
            );
        }

        revalidatePath(`/factory/${data.factoryId}`);
        revalidatePath(`/factory/${data.factoryId}/invoices/${data.id}`);
        return { success: true, invoiceId: data.id };
    } catch (error) {
        console.error("Failed to update invoice:", error);
        revalidatePath(`/factory/${data.factoryId}`);
        return { error: "Failed to update invoice" };
    }
}
