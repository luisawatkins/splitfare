"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  Input,
  Avatar,
  Badge,
  Skeleton,
  Modal,
  BottomSheet,
  TabBar,
  EmptyState,
  AmountDisplay,
  useToast,
  ToastProvider,
} from "@/components";
import { Search, Plus, Home, Users, Receipt, Settings, Bell } from "lucide-react";

function DemoContent() {
  const { notify } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  const tabs = [
    { key: "home", label: "Home", icon: <Home size={20} /> },
    { key: "groups", label: "Groups", icon: <Users size={20} /> },
    { key: "expenses", label: "Expenses", icon: <Receipt size={20} /> },
    { key: "settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md">
        <h1 className="text-xl font-bold tracking-tight">Design System</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
          </Button>
          <Avatar 
            src="https://github.com/shadcn.png" 
            fallback="SF" 
          />
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-8 p-4">
        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Buttons & Badges</h2>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => notify({ title: "Primary clicked", variant: "default" })}>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
          </div>
        </section>

        {/* Amount & Cards */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Financials</h2>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <AmountDisplay cents={1245050} className="text-3xl font-black" />
              </div>
              <Button size="icon" className="h-12 w-12 rounded-full">
                <Plus />
              </Button>
            </div>
            <div className="mt-4 flex gap-2">
              <Badge variant="success" className="px-2 py-1">+ $240.00 this week</Badge>
            </div>
          </Card>
        </section>

        {/* Form Elements */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Forms</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input placeholder="Search groups or friends..." className="pl-10" />
          </div>
        </section>

        {/* Feedback & Interaction */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Interactions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full" onClick={() => setIsModalOpen(true)}>
              Open Modal
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setIsSheetOpen(true)}>
              Open Bottom Sheet
            </Button>
          </div>

          <Button 
            variant="secondary" 
            className="w-full"
            onClick={() => notify({ 
              title: "Success!", 
              description: "Everything is looking good.", 
              variant: "success" 
            })}
          >
            Trigger Success Toast
          </Button>
        </section>

        {/* Skeletons */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Loading States</h2>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        </section>

        {/* Empty States */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Empty States</h2>
          <EmptyState
            title="No expenses yet"
            description="Snap a receipt to start splitting fares with your friends."
            actionLabel="Add Expense"
            onActionClick={() => setIsSheetOpen(true)}
          />
        </section>
      </main>

      <TabBar 
        items={tabs} 
        activeKey={activeTab} 
        onChange={setActiveTab} 
      />

      <Modal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        title="Confirm Settlement"
        description="Are you sure you want to settle the balance with Alice? This will initiate a cross-chain USDC transfer."
      >
        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">You owe</p>
            <AmountDisplay cents={4500} className="text-2xl font-bold" />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={() => {
              setIsModalOpen(false);
              notify({ title: "Settlement initiated", variant: "success" });
            }}>Settle Now</Button>
          </div>
        </div>
      </Modal>

      <BottomSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen}
      >
        <div className="space-y-6 pb-8">
          <div className="text-center">
            <h3 className="text-lg font-bold">New Expense</h3>
            <p className="text-sm text-muted-foreground">Fill in the details for your split.</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider">Amount</label>
              <Input type="number" placeholder="0.00" className="text-lg font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider">Description</label>
              <Input placeholder="What was it for?" />
            </div>
            <Button className="w-full h-12" onClick={() => setIsSheetOpen(false)}>
              Create Split
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

export default function DemoPage() {
  return (
    <ToastProvider>
      <DemoContent />
    </ToastProvider>
  );
}
