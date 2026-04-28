"use client";

import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReceiptActions() {
  return (
    <div className="flex flex-wrap justify-end gap-2 print:hidden">
      <Button type="button" variant="outline" onClick={() => window.print()}>
        <Printer className="h-4 w-4" />
        Print
      </Button>
      <Button type="button" onClick={() => window.print()}>
        <Download className="h-4 w-4" />
        Download PDF
      </Button>
    </div>
  );
}
