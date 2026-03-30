"use client";

import { useFormContext } from "react-hook-form";
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CATEGORIES, type ExpenseFormValues } from "@/lib/validations/expense";
import { formatCurrencyInput, parseCurrency } from "@/lib/currency";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tag, Utensils, Car, Home, Zap, Plane } from "lucide-react";

const categoryIcons: Record<string, typeof Tag> = {
  other: Tag,
  food: Utensils,
  transport: Car,
  accommodation: Home,
  travel: Plane,
  subscription: Zap,
};

interface StepBasicProps {
  members: Array<{ id: string; name: string }>;
}

export function StepBasic({ members }: StepBasicProps) {
  const { control } = useFormContext<ExpenseFormValues>();
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Input placeholder="Dinner, Groceries, etc." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Amount</FormLabel>
            <FormControl>
              <Input
                placeholder="$0.00"
                value={field.value ? formatCurrencyInput(field.value.toString()) : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const numeric = parseCurrency(val);
                  field.onChange(numeric);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" value={CATEGORIES.find(c => c.id === field.value)?.name} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIES.map((cat) => {
                    const Icon = categoryIcons[cat.id] || Tag;
                    return (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{cat.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="paidById"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Paid by</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Who paid?" value={members.find(m => m.id === field.value)?.name} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
