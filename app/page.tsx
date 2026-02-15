
import { AddFactoryDialog } from "@/components/add-factory-dialog";
import { LoginButton } from "@/components/login-button";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getFactories } from "@/actions/factory";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { Building2, ChevronRight, Plus } from "lucide-react";
import { FadeIn, MotionCard, StaggerContainer } from "@/components/framer-motion-utils";
import { FactoryList } from "@/components/factory-list";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <FadeIn className="text-center max-w-2xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl">
              Radhekrishna <br />
              <span className="text-indigo-600">Engineering</span>
            </h1>
            <p className="text-xl leading-8 text-slate-600">
              Professional Bill Book & Factory Management System.
              <br /> Manage multiple units, generate GST invoices, and track your growth.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <LoginButton />
          </div>
        </FadeIn>
      </div>
    );
  }

  const factories = await getFactories();

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {/* Header Section */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">Radhekrishna</h1>
              <span className="text-sm text-indigo-600 font-medium">Engineering</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-sm text-slate-500">
              Welcome, {session.user?.name}
            </div>
            <LoginButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto py-12 px-4 max-w-6xl">
        <FadeIn className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Your Factories</h2>
          <p className="text-slate-500 mt-1">Select a workspace to manage invoices or create a new one.</p>
        </FadeIn>

        <FactoryList factories={factories} />
      </main>
    </div>
  );
}
