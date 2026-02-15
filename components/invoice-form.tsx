
"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createInvoice, updateInvoice } from "@/actions/invoice";
import { getNextInvoiceNumber } from "@/actions/invoice-number";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save } from "lucide-react";
import { numberToWords } from "@/lib/utils"; // We need to create this util

interface InvoiceFormProps {
    factoryId: string;
    customers: { id: string; name: string; mobile?: string | null; address?: string | null; gstin?: string | null }[];
    initialData?: any; // Add initialData prop
}

export default function InvoiceForm({ factoryId, customers, initialData }: InvoiceFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [invoiceNo, setInvoiceNo] = useState(initialData?.invoiceNo || "");
    const [date, setDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (!invoiceNo && !initialData) {
            getNextInvoiceNumber(factoryId).then(res => {
                if (res && res.nextInvoiceNo) {
                    setInvoiceNo(res.nextInvoiceNo);
                }
            });
        }
    }, [factoryId, initialData, invoiceNo]);

    const [customer, setCustomer] = useState({
        name: initialData?.customerName || "",
        address: initialData?.customerAddress || "",
        mobile: initialData?.customerMobile || "",
        gstin: initialData?.customerGstin || ""
    });

    const [items, setItems] = useState(initialData?.items?.map((item: any, index: number) => ({ ...item, id: item.id || index })) || [{ id: 1, name: "", quantity: 1, rate: 0, amount: 0 }]);

    const [gstEnabled, setGstEnabled] = useState((initialData?.gstRate || 0) > 0);
    const [gstRate, setGstRate] = useState(initialData?.gstRate || 18);

    const calculateTotal = () => {
        const subTotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.rate), 0);
        const gstAmount = gstEnabled ? (subTotal * gstRate) / 100 : 0;
        const totalAmount = subTotal + gstAmount;
        return { subTotal, gstAmount, totalAmount };
    };

    const totals = calculateTotal();

    const handleItemChange = (id: number, field: string, value: string | number) => {
        setItems(items.map((item: any) => {
            if (item.id === id) {
                const newItem = { ...item, [field]: value };
                if (field === "quantity" || field === "rate") {
                    newItem.amount = newItem.quantity * newItem.rate;
                }
                return newItem;
            }
            return item;
        }));
    };

    const addItem = () => {
        setItems([...items, { id: Date.now(), name: "", quantity: 1, rate: 0, amount: 0 }]);
    };

    const removeItem = (id: number) => {
        if (items.length > 1) {
            setItems(items.filter((item: any) => item.id !== id));
        }
    };

    const handleSubmit = () => {
        if (!customer.name || !invoiceNo) {
            alert("Please fill required fields (Invoice No, Customer Name)");
            return;
        }

        startTransition(async () => {
            const invoiceData = {
                factoryId,
                invoiceNo,
                date: new Date(date),
                customerName: customer.name,
                customerAddress: customer.address,
                customerMobile: customer.mobile,
                customerGstin: customer.gstin,
                items,
                subTotal: totals.subTotal,
                gstRate: gstEnabled ? gstRate : 0,
                gstAmount: totals.gstAmount,
                totalAmount: totals.totalAmount,
            };

            let result;
            if (initialData?.id) {
                result = await updateInvoice({ ...invoiceData, id: initialData.id });
            } else {
                result = await createInvoice(invoiceData);
            }

            if (result.success) {
                // Redirect to view/print page
                router.push(`/factory/${factoryId}/invoices/${result.invoiceId}`);
            } else {
                alert("Failed to save invoice");
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">New Tax Invoice</h2>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setGstEnabled(!gstEnabled)}>
                        {gstEnabled ? "Disable GST" : "Enable GST"}
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        <Save className="mr-2 h-4 w-4" /> Save Invoice
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Invoice Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Invoice No.</Label>
                                <Input value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} placeholder="INV-001" />
                            </div>
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Customer Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Party Name</Label>
                            {/* Could be a Combobox for selecting existing customers */}
                            <Input value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} placeholder="Enter customer name" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Mobile</Label>
                                <Input value={customer.mobile} onChange={e => setCustomer({ ...customer, mobile: e.target.value })} placeholder="Mobile No" />
                            </div>
                            <div className="space-y-2">
                                <Label>GSTIN</Label>
                                <Input value={customer.gstin} onChange={e => setCustomer({ ...customer, gstin: e.target.value })} placeholder="GSTIN (Optional)" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Address</Label>
                            <Textarea value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} placeholder="Billing Address" rows={2} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead>Items Name</TableHead>
                                <TableHead className="w-[100px]">Qty</TableHead>
                                <TableHead className="w-[120px]">Rate</TableHead>
                                <TableHead className="w-[120px] text-right">Amount</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item: any, index: number) => (
                                <TableRow key={item.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                        <Input
                                            value={item.name}
                                            onChange={e => handleItemChange(item.id, "name", e.target.value)}
                                            placeholder="Product / Service Name"
                                            className="border-0 focus-visible:ring-0 px-0 h-auto"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={item.quantity}
                                            onChange={e => handleItemChange(item.id, "quantity", parseFloat(e.target.value) || 0)}
                                            className="h-8"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={item.rate}
                                            onChange={e => handleItemChange(item.id, "rate", parseFloat(e.target.value) || 0)}
                                            className="h-8"
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        ₹{item.amount.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="p-4 border-t">
                        <Button variant="outline" size="sm" onClick={addItem}>
                            <Plus className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <div className="w-full md:w-1/3 space-y-2">
                    <div className="flex justify-between py-2 border-b">
                        <span>Sub Total:</span>
                        <span className="font-medium">₹{totals.subTotal.toFixed(2)}</span>
                    </div>
                    {gstEnabled && (
                        <div className="flex justify-between py-2 border-b text-sm">
                            <div className="flex items-center gap-2">
                                <span>GST ({gstRate}%):</span>
                                {/* Could add a select for GST Rate */}
                            </div>
                            <span>₹{totals.gstAmount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between py-2 text-lg font-bold">
                        <span>Grand Total:</span>
                        <span>₹{totals.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
