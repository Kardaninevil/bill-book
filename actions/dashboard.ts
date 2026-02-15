
"use server";

import { db } from "@/db";
import { invoices } from "@/db/schema";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { eq, and, sql } from "drizzle-orm";

export async function getDashboardStats(factoryId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    // 1. Total Revenue
    const totalRevenueResult = await db
        .select({ total: sql<number>`sum(${invoices.totalAmount})` })
        .from(invoices)
        .where(and(eq(invoices.factoryId, factoryId)));

    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // 2. Invoice Count
    const invoiceCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(invoices)
        .where(and(eq(invoices.factoryId, factoryId)));

    const invoiceCount = invoiceCountResult[0]?.count || 0;

    // 3. Monthly Sales (Last 6 Months)
    // SQLite date handling can be tricky. We'll fetch relevant data and process in JS for simplicity/compatibility 
    // or use strftime if generic sqlite driver supports it well.
    // For now, let's fetch all invoices for this factory (assuming not huge scale yet) and aggregate in JS for safety.

    const allInvoices = await db
        .select({ date: invoices.date, amount: invoices.totalAmount })
        .from(invoices)
        .where(and(eq(invoices.factoryId, factoryId)));

    const monthlyData: Record<string, number> = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = d.toLocaleString('default', { month: 'short', year: '2-digit' }); // e.g., "Jan 24"
        monthlyData[key] = 0;
    }

    allInvoices.forEach(inv => {
        const key = inv.date.toLocaleString('default', { month: 'short', year: '2-digit' });
        if (monthlyData[key] !== undefined) {
            monthlyData[key] += inv.amount;
        }
    });

    const chartData = Object.entries(monthlyData).map(([name, total]) => ({ name, total }));

    return {
        totalRevenue,
        invoiceCount,
        chartData
    };
}
