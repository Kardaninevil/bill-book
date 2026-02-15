
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { invoices, customers } from "@/db/schema";
import { eq } from "drizzle-orm";
import InvoiceForm from "@/components/invoice-form";

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string; invoiceId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/");

    const { id: factoryId, invoiceId } = await params;

    const invoice = await db.query.invoices.findFirst({
        where: eq(invoices.id, invoiceId),
        with: {
            items: true,
        },
    });

    if (!invoice || invoice.userId !== session.user.id) {
        return notFound();
    }

    // Fetch customers for autocomplete/selection (reusing logic from new invoice page)
    const userCustomers = await db.select().from(customers).where(eq(customers.userId, session.user.id));

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold mb-6">Edit Invoice</h1>
            <InvoiceForm
                factoryId={factoryId}
                customers={userCustomers}
                initialData={invoice}
            />
        </div>
    );
}
