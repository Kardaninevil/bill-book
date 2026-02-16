
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { factories, invoices } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ArrowLeft, Edit } from "lucide-react";
import { PrintButton } from "@/components/print-button"; // Client component for window.print()
import { DownloadButton } from "@/components/download-button";
import { numberToWords } from "@/lib/utils";

interface InvoicePageProps {
    params: {
        id: string; // Factory ID
        invoiceId: string;
    };
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string; invoiceId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/");

    const { invoiceId } = await params;

    const invoice = await db.query.invoices.findFirst({
        where: eq(invoices.id, invoiceId),
        with: {
            items: true,
            factory: true,
        }
    });

    if (!invoice) notFound();

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-end gap-2 mb-4 print:hidden">
                <DownloadButton invoiceNo={invoice.invoiceNo} />
                <PrintButton />
            </div>

            {/* A4 Invoice Container */}
            <div id="invoice-content" className="bg-white text-black p-8 mx-auto border shadow-sm print:shadow-none print:border-0 print:p-0" style={{ maxWidth: '210mm', minHeight: '297mm' }}>

                {/* Header */}
                <div className="text-center border-b pb-4 mb-4">
                    <h1 className="text-2xl font-bold uppercase tracking-wider">{invoice.factory.name}</h1>
                    <p className="text-sm whitespace-pre-wrap">{invoice.factory.address}</p>
                    {invoice.factory.gstin && <p className="text-sm">GSTIN: {invoice.factory.gstin}</p>}
                </div>

                <div className="flex justify-between items-center mb-2 border-b pb-2">
                    <span className="text-sm">Nature of Invoice: <b>{(invoice.gstRate || 0) > 0 ? "Tax Invoice" : "Bill of Supply"}</b></span>
                    <span className="text-sm">(Original for Recipient)</span>
                </div>

                {/* Customer & Invoice Details */}
                <div className="flex justify-between mb-6">
                    <div className="w-1/2 pr-4 border-r">
                        <h3 className="font-bold text-sm mb-1">Details of Receiver (Billed to):</h3>
                        <p className="font-bold">{invoice.customerName}</p>
                        <p className="text-sm whitespace-pre-wrap">{invoice.customerAddress}</p>
                        {invoice.customerMobile && <p className="text-sm">Mobile: {invoice.customerMobile}</p>}
                        {invoice.customerGstin && <p className="text-sm">GSTIN: {invoice.customerGstin}</p>}
                    </div>
                    <div className="w-1/2 pl-4">
                        <div className="flex justify-between mb-1">
                            <span className="font-bold text-sm">Invoice No:</span>
                            <span className="font-mono">{invoice.invoiceNo}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span className="font-bold text-sm">Invoice Date:</span>
                            <span>{invoice.date.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span className="font-bold text-sm">State:</span>
                            <span>State Name (Code)</span>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-6 border-collapse border border-gray-300">
                    <thead className="bg-gray-50">
                        <tr className="text-sm">
                            <th className="border p-2 text-center w-12">Sr.</th>
                            <th className="border p-2 text-left">Items Name</th>
                            <th className="border p-2 text-right w-24">Qty</th>
                            <th className="border p-2 text-right w-24">Rate</th>
                            <th className="border p-2 text-right w-32">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item, index) => (
                            <tr key={item.id} className="text-sm">
                                <td className="border p-2 text-center">{index + 1}</td>
                                <td className="border p-2">{item.name}</td>
                                <td className="border p-2 text-right">{item.quantity}</td>
                                <td className="border p-2 text-right">₹{item.rate.toFixed(2)}</td>
                                <td className="border p-2 text-right">₹{item.amount.toFixed(2)}</td>
                            </tr>
                        ))}
                        {/* Empty rows filler if needed for layout height */}
                    </tbody>
                    <tfoot>
                        <tr className="font-bold">
                            <td colSpan={4} className="border p-2 text-right">Sub Total</td>
                            <td className="border p-2 text-right">₹{invoice.subTotal.toFixed(2)}</td>
                        </tr>
                        {(invoice.gstAmount || 0) > 0 && (
                            <tr className="font-bold">
                                <td colSpan={4} className="border p-2 text-right">GST ({invoice.gstRate}%)</td>
                                <td className="border p-2 text-right">₹{(invoice.gstAmount || 0).toFixed(2)}</td>
                            </tr>
                        )}
                        <tr className="font-bold bg-gray-100 text-lg">
                            <td colSpan={4} className="border p-2 text-right">Grand Total</td>
                            <td className="border p-2 text-right">₹{invoice.totalAmount.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>

                {/* Amount in words */}
                <div className="mb-6 border-b pb-4">
                    <span className="text-sm font-bold mr-2">Amount in Words:</span>
                    <span className="italic">{numberToWords(Math.round(invoice.totalAmount))} Rupees Only</span>
                </div>

                {/* Footer / Terms */}
                <div className="flex justify-between items-end mt-auto pt-8">
                    <div className="text-sm w-1/2">
                        <h4 className="font-bold mb-1">Terms & Conditions:</h4>
                        <ol className="list-decimal list-inside text-xs">
                            <li>Goods once sold will not be taken back.</li>
                            <li>Interest @18% p.a. will be charged if payment is delayed.</li>
                            <li>Subject to local jurisdiction.</li>
                        </ol>
                    </div>
                    <div className="text-center w-1/3">
                        <p className="font-bold mb-8">For {invoice.factory.name}</p>
                        <div className="h-12"></div>
                        <p className="text-xs">(Authorised Signatory)</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
