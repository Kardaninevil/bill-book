
import InvoiceForm from "@/components/invoice-form";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function NewInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/");

    const { id: factoryId } = await params;

    // Fetch customers for autocomplete/selection
    const userCustomers = await db.select().from(customers).where(eq(customers.userId, session.user.id));

    return (
        <div className="container mx-auto py-6 max-w-4xl">
            <InvoiceForm factoryId={factoryId} customers={userCustomers} />
        </div>
    );
}
