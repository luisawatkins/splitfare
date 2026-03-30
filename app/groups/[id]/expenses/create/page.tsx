"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema, type ExpenseFormValues } from "@/lib/validations/expense";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { StepBasic } from "@/components/expense-form/step-basic";
import { StepSplit } from "@/components/expense-form/step-split";
import { StepReceipt } from "@/components/expense-form/step-receipt";
import { StepReview } from "@/components/expense-form/step-review";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toDbUserId } from "@/lib/privy-utils";
import { usePrivy } from "@privy-io/react-auth";

const steps = [
  { id: "basic", title: "Basic Info" },
  { id: "split", title: "Split Config" },
  { id: "receipt", title: "Receipt" },
  { id: "review", title: "Review" },
];

export default function CreateExpensePage() {
  const router = useRouter();
  const { id: groupId } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const { notify } = useToast();
  const queryClient = useQueryClient();
  const { user: privyUser, getAccessToken } = usePrivy();
  const currentUserId = privyUser ? toDbUserId(privyUser.id) : "";

  const { data: members = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["group-members", groupId],
    queryFn: async () => {
      const token = await getAccessToken();
      const res = await fetch(`/api/groups/${groupId}/members`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to fetch members");
      return result.data.map((m: any) => ({
        id: m.user.id,
        name: m.user.id === currentUserId ? "You" : (m.user.name || m.user.email || "Unknown Member")
      }));
    },
    enabled: !!groupId && !!privyUser,
  });

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      description: "",
      amount: 0,
      date: new Date(),
      category: "other",
      paidById: currentUserId,
      splitType: "EQUAL",
      members: [],
    },
  });

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 0) {
      fieldsToValidate = ["description", "amount", "date", "category", "paidById"];
    } else if (currentStep === 1) {
      fieldsToValidate = ["splitType", "members"];
    }

    const isValid = await form.trigger(fieldsToValidate as any);
    
    if (isValid) {
      triggerHaptic();
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    triggerHaptic();
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: ExpenseFormValues) => {
    try {
      console.log("Submitting expense:", data);
      triggerHaptic();

      const token = await getAccessToken();
      
      const splits = data.members
        .filter(m => m.involved)
        .map(m => ({
          userId: m.userId,
          amount: m.amount || 0,
          percentage: m.percentage,
          shares: m.shares,
        }));

      const res = await fetch(`/api/groups/${groupId}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: data.description,
          amount: data.amount,
          date: data.date.toISOString(),
          category: data.category,
          paidById: data.paidById,
          splitType: data.splitType,
          splits: splits,
          receiptCid: data.receiptCid,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to create expense");
      }

      await queryClient.invalidateQueries({ queryKey: ["expenses", groupId] });
      await queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      await queryClient.invalidateQueries({ queryKey: ["group-members", groupId] });

      notify({
        title: "Success",
        description: "Expense created successfully!",
        variant: "success",
      });
      router.push(`/groups/${groupId}`);
    } catch (error: any) {
      console.error("Expense creation error:", error);
      notify({
        title: "Error",
        description: error.message || "Failed to create expense. Please try again.",
        variant: "error",
      });
    }
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 pb-24">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <X className="h-5 w-5" />
        </Button>
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-bold">New Expense</h1>
          <div className="flex gap-1 mt-2">
            {steps.map((_, i: number) => (
              <div 
                key={i} 
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  i <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="w-10" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {currentStep === 0 && <StepBasic members={members} />}
          {currentStep === 1 && <StepSplit members={members} />}
          {currentStep === 2 && <StepReceipt />}
          {currentStep === 3 && <StepReview members={members} />}

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t md:relative md:border-0 md:p-0">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 flex gap-3">
              {currentStep > 0 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 gap-2"
                  onClick={prevStep}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
              
              {!isLastStep ? (
                <Button 
                  type="button" 
                  className="flex-[2] gap-2"
                  onClick={nextStep}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="flex-[2] gap-2"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Creating..." : "Confirm & Create"}
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
