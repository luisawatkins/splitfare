"use client";

import { useFormContext } from "react-hook-form";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { type ExpenseFormValues } from "@/lib/validations/expense";
import { ReceiptCapture } from "@/components/receipt-capture";

export function StepReceipt() {
  const { control, setValue } = useFormContext<ExpenseFormValues>();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <FormField
        control={control}
        name="receiptCid"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Receipt Attachment (Optional)</FormLabel>
            <div className="mt-2">
              <ReceiptCapture 
                initialCid={field.value}
                onUploadSuccess={(cid) => {
                  setValue("receiptCid", cid);
                }}
              />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
        <div className="bg-primary/10 p-2 rounded-lg">
          <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold text-primary">Secure Decentralized Storage</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
            Your receipts are encrypted and stored on IPFS via Storacha, ensuring they are permanent and verifiable.
          </p>
        </div>
      </div>
    </div>
  );
}
