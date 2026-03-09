"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type ExpenseFormValues, type SplitType } from "@/lib/validations/expense";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { Check, Users, Hash, Percent, PieChart } from "lucide-react";
import { useEffect } from "react";

const splitTypes: { id: SplitType; label: string; icon: any }[] = [
  { id: "EQUAL", label: "Equally", icon: Users },
  { id: "EXACT", label: "Exact amounts", icon: Hash },
  { id: "PERCENTAGE", label: "Percentages", icon: Percent },
  { id: "SHARES", label: "Shares", icon: PieChart },
];

interface StepSplitProps {
  members: Array<{ id: string; name: string }>;
}

export function StepSplit({ members: groupMembers }: StepSplitProps) {
  const { control, watch, setValue } = useFormContext<ExpenseFormValues>();
  const { fields } = useFieldArray({
    control,
    name: "members",
  });

  const splitType = watch("splitType");
  const totalAmount = watch("amount");
  const formMembers = watch("members");

  useEffect(() => {
    if (fields.length === 0 && groupMembers.length > 0) {
      const initialMembers = groupMembers.map(m => ({
        userId: m.id,
        involved: true,
        amount: 0,
        percentage: 0,
        shares: 1,
      }));
      setValue("members", initialMembers);
    }
  }, [fields.length, groupMembers, setValue]);

  const toggleMember = (index: number) => {
    const current = formMembers[index].involved;
    setValue(`members.${index}.involved`, !current);
  };

  const involvedCount = formMembers.filter(m => m.involved).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-3">
        <FormLabel>Split Type</FormLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {splitTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Button
                key={type.id}
                type="button"
                variant={splitType === type.id ? "default" : "outline"}
                className={cn(
                  "h-20 flex flex-col gap-2 items-center justify-center",
                  splitType === type.id && "ring-2 ring-primary ring-offset-2"
                )}
                onClick={() => setValue("splitType", type.id)}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{type.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <FormLabel>Split with</FormLabel>
          <span className="text-xs text-muted-foreground">
            {involvedCount} members selected
          </span>
        </div>
        
        <div className="space-y-3">
          {fields.map((field, index) => {
            const member = groupMembers.find(m => m.id === field.userId);
            const isInvolved = formMembers[index]?.involved;

            return (
              <div 
                key={field.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-colors",
                  isInvolved ? "bg-accent/50 border-primary/50" : "bg-background border-input"
                )}
              >
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => toggleMember(index)}
                >
                  <div className={cn(
                    "h-5 w-5 rounded border flex items-center justify-center transition-colors",
                    isInvolved ? "bg-primary border-primary text-primary-foreground" : "border-input"
                  )}>
                    {isInvolved && <Check className="h-3 w-3" />}
                  </div>
                  <span className="text-sm font-medium">{member?.name || "Unknown Member"}</span>
                </div>

                {isInvolved && splitType !== "EQUAL" && (
                  <div className="w-24">
                    {splitType === "EXACT" && (
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="h-8 text-right"
                        {...control.register(`members.${index}.amount`, { valueAsNumber: true })}
                      />
                    )}
                    {splitType === "PERCENTAGE" && (
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0"
                          className="h-8 text-right pr-6"
                          {...control.register(`members.${index}.percentage`, { valueAsNumber: true })}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                      </div>
                    )}
                    {splitType === "SHARES" && (
                      <Input
                        type="number"
                        placeholder="1"
                        className="h-8 text-right"
                        {...control.register(`members.${index}.shares`, { valueAsNumber: true })}
                      />
                    )}
                  </div>
                )}

                {isInvolved && splitType === "EQUAL" && (
                  <span className="text-xs font-medium text-muted-foreground">
                    ${(totalAmount / involvedCount).toFixed(2)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {splitType === "PERCENTAGE" && (
        <div className="p-3 rounded-lg bg-muted/50 flex justify-between items-center">
          <span className="text-sm">Total Percentage</span>
          <span className={cn(
            "font-bold",
            formMembers.reduce((acc, m) => acc + (m.involved ? (m.percentage || 0) : 0), 0) === 100 
              ? "text-green-500" 
              : "text-destructive"
          )}>
            {formMembers.reduce((acc, m) => acc + (m.involved ? (m.percentage || 0) : 0), 0)}% / 100%
          </span>
        </div>
      )}

      {splitType === "EXACT" && (
        <div className="p-3 rounded-lg bg-muted/50 flex justify-between items-center">
          <span className="text-sm">Total Allocated</span>
          <span className={cn(
            "font-bold",
            formMembers.reduce((acc, m) => acc + (m.involved ? (m.amount || 0) : 0), 0) === totalAmount 
              ? "text-green-500" 
              : "text-destructive"
          )}>
            ${formMembers.reduce((acc, m) => acc + (m.involved ? (m.amount || 0) : 0), 0).toFixed(2)} / ${totalAmount.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}
