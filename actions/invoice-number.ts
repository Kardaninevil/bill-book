
"use server";

import { db } from "@/db";
import { invoices } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function getNextInvoiceNumber(factoryId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    const lastInvoice = await db.query.invoices.findFirst({
        where: eq(invoices.factoryId, factoryId),
        orderBy: [desc(invoices.createdAt)],
    });

    if (!lastInvoice) {
        return { nextInvoiceNo: "001" };
    }

    const lastNo = lastInvoice.invoiceNo;
    // Try to extract number
    const match = lastNo.match(/(\d+)$/);

    if (match) {
        const numberPart = match[1];
        const nextNumber = parseInt(numberPart, 10) + 1;
        // Pad with zeros to keep the same length
        const paddedNext = nextNumber.toString().padStart(numberPart.length, "0");
        const prefix = lastNo.substring(0, lastNo.length - numberPart.length);
        return { nextInvoiceNo: `${prefix}${paddedNext}` };
    }

    // Fallback if no specific format detected
    return { nextInvoiceNo: `${lastNo}-1` };
}
