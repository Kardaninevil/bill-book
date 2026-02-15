
import {
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Users, IndianRupee, Edit } from "lucide-react";
import Link from "next/link";
import { getFactory } from "@/actions/factory";
import { db } from "@/db";
import { invoices } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { OverviewChart } from "@/components/overview-chart";
import { getDashboardStats } from "@/actions/dashboard";
import { FadeIn, MotionCard, StaggerContainer } from "@/components/framer-motion-utils";

interface FactoryPageProps {
    params: Promise<{ id: string }>;
}

export default async function FactoryDashboard({ params }: FactoryPageProps) {
    const { id: factoryId } = await params;
    const factory = await getFactory(factoryId);

    if (!factory) {
        notFound();
    }

    const [recentInvoices, stats] = await Promise.all([
        db.query.invoices.findMany({
            where: eq(invoices.factoryId, factoryId),
            orderBy: [desc(invoices.createdAt)],
            limit: 5,
        }),
        getDashboardStats(factoryId)
    ]);

    const chartData = "chartData" in stats && stats.chartData ? stats.chartData : [];
    const totalRevenue = "totalRevenue" in stats && stats.totalRevenue ? stats.totalRevenue : 0;
    const invoiceCount = "invoiceCount" in stats && stats.invoiceCount ? stats.invoiceCount : 0;

    return (
        <div className="container mx-auto py-8 space-y-8">
            <FadeIn className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{factory.name}</h1>
                    <p className="text-muted-foreground">{factory.address}</p>
                </div>
                <div className="flex gap-3">
                    <Link href={`/factory/${factoryId}/customers`}>
                        <Button variant="outline">
                            <Users className="mr-2 h-4 w-4" /> Customers
                        </Button>
                    </Link>
                    <Link href={`/factory/${factoryId}/invoices/new`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Invoice
                        </Button>
                    </Link>
                </div>
            </FadeIn>

            <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MotionCard variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <p className="text-xs text-muted-foreground">
                            Across {invoiceCount} invoices
                        </p>
                    </CardContent>
                </MotionCard>
                <MotionCard variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Invoices</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{invoiceCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Total generated
                        </p>
                    </CardContent>
                </MotionCard>
            </StaggerContainer>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <MotionCard className="col-span-4" variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}>
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <OverviewChart data={chartData} />
                    </CardContent>
                </MotionCard>
                <MotionCard className="col-span-3" variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}>
                    <CardHeader>
                        <CardTitle>Recent Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {recentInvoices.length === 0 && <p className="text-muted-foreground">No invoices yet.</p>}
                            {recentInvoices.map((invoice) => (
                                <div key={invoice.id} className="group flex items-center justify-between p-2 rounded hover:bg-slate-50 transition-colors">
                                    <Link href={`/factory/${factoryId}/invoices/${invoice.id}`} className="flex-1 flex items-center">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {invoice.invoiceNo}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {invoice.customerName}
                                            </p>
                                        </div>
                                    </Link>
                                    <div className="flex items-center gap-4">
                                        <div className="font-medium">
                                            +₹{invoice.totalAmount.toFixed(2)}
                                        </div>
                                        <Link href={`/factory/${factoryId}/invoices/${invoice.id}/edit`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </MotionCard>
            </div>
        </div>
    );
}
