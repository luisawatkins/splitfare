"use client";

import { useFormContext } from "react-hook-form";
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { type ExpenseFormValues } from "@/lib/validations/expense";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, FileText, Image as ImageIcon } from "lucide-react";
import { useRef, useState } from "react";
import Image from "next/image";

export function StepReceipt() {
  const { control, setValue, watch } = useFormContext<ExpenseFormValues>();
  const [preview, setPreview] = useState<string | null>(watch("receiptUrl") || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setValue("receiptUrl", url);
    }
  };

  const removeReceipt = () => {
    setPreview(null);
    setValue("receiptUrl", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <FormField
        control={control}
        name="receiptUrl"
        render={() => (
          <FormItem>
            <FormLabel>Receipt Attachment (Optional)</FormLabel>
            <div className="mt-2">
              {preview ? (
                <div className="relative rounded-lg overflow-hidden border bg-muted aspect-[3/4] group">
                  <Image
                    src={preview}
                    alt="Receipt preview"
                    fill
                    className="object-contain"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8 rounded-full shadow-lg"
                      onClick={removeReceipt}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center gap-4 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Camera className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Take a photo or upload</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, JPG, PNG up to 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button type="button" variant="outline" size="sm" className="gap-2">
                      <Camera className="h-4 w-4" />
                      Camera
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg flex flex-col gap-2 items-center text-center bg-muted/10">
          <FileText className="h-6 w-6 text-muted-foreground" />
          <span className="text-xs font-medium">Auto-scan receipt (Coming soon)</span>
        </div>
        <div className="p-4 border rounded-lg flex flex-col gap-2 items-center text-center bg-muted/10">
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
          <span className="text-xs font-medium">Recent photos</span>
        </div>
      </div>
    </div>
  );
}
