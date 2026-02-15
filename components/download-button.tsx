"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { useState } from "react";

interface DownloadButtonProps {
    invoiceNo: string;
}

export function DownloadButton({ invoiceNo }: DownloadButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        const invoiceElement = document.getElementById("invoice-content");
        if (!invoiceElement) return;

        try {
            setIsGenerating(true);

            // Temporarily remove print-specific styles that might interfere
            const originalStyle = invoiceElement.getAttribute("style");
            invoiceElement.style.width = "210mm";
            invoiceElement.style.height = "297mm";
            invoiceElement.style.maxWidth = "none";
            invoiceElement.style.maxHeight = "none";

            // Use html-to-image which handles modern CSS (oklch/lab) better
            const dataUrl = await toPng(invoiceElement, {
                quality: 1.0,
                pixelRatio: 2, // Higher resolution
                backgroundColor: "#ffffff"
            });

            // Restore styles
            if (originalStyle) {
                invoiceElement.setAttribute("style", originalStyle);
            } else {
                invoiceElement.removeAttribute("style");
            }

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });

            const imgWidth = 210;
            const imgHeight = 297; // Since we forced the element to 297mm

            pdf.addImage(dataUrl, "PNG", 0, 0, imgWidth, imgHeight);
            pdf.save(`${invoiceNo}.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            alert("Failed to generate PDF. Please try printing to PDF instead.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button onClick={handleDownload} disabled={isGenerating} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {isGenerating ? "Generating..." : "Download PDF"}
        </Button>
    );
}
