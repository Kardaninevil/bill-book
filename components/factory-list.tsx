
"use client";

import Link from "next/link";
import { Building2, ChevronRight, Plus, Trash2, Search } from "lucide-react";
import { MotionCard, StaggerContainer } from "@/components/framer-motion-utils";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddFactoryDialog } from "@/components/add-factory-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { deleteFactory } from "@/actions/factory";
import { useRouter } from "next/navigation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Factory {
    id: string;
    name: string;
    address: string;
    gstin: string | null;
}

export function FactoryList({ factories }: { factories: Factory[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const filteredFactories = factories.filter(factory =>
        factory.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        factory.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = (id: string) => {
        startTransition(async () => {
            await deleteFactory(id);
        });
    };

    return (
        <div className="space-y-8">
            <div className="relative max-w-md mx-auto md:mx-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search factories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white"
                    suppressHydrationWarning
                />
            </div>

            <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                    {filteredFactories.map((factory) => (
                        <motion.div
                            key={factory.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            layout
                        >
                            <MotionCard
                                className="h-full hover:shadow-xl transition-all duration-300 border-slate-200 group-hover:border-indigo-200 bg-white relative group"
                                whileHover={{ y: -5 }}
                            >
                                {/* Delete Button - Positioned Absolutely and Outside Link */}
                                <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Factory?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete <strong>{factory.name}</strong> and all associated invoices and customers. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(factory.id);
                                                    }}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>

                                <Link href={`/factory/${factory.id}`} className="block h-full relative z-10">
                                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pr-12">
                                        <div className="flex flex-row items-center gap-3">
                                            <div className="bg-indigo-50 p-2 rounded-full group-hover:bg-indigo-100 transition-colors">
                                                <Building2 className="h-5 w-5 text-indigo-600" />
                                            </div>
                                            <CardTitle className="text-xl font-bold text-slate-800 break-all">{factory.name}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-sm line-clamp-2 mb-4">{factory.address}</CardDescription>
                                        {factory.gstin && (
                                            <div className="text-xs font-medium text-slate-500 bg-slate-100 inline-block px-2 py-1 rounded">
                                                GSTIN: {factory.gstin}
                                            </div>
                                        )}
                                        <div className="mt-4 flex items-center text-sm font-medium text-indigo-600">
                                            Manage <ChevronRight className="h-4 w-4 ml-1" />
                                        </div>
                                    </CardContent>
                                </Link>
                            </MotionCard>
                        </motion.div>
                    ))}
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    layout
                >
                    <AddFactoryDialog trigger={
                        <button
                            className="w-full h-full min-h-[180px] border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-6 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-300 group"
                            suppressHydrationWarning
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center mb-4 transition-colors">
                                <Plus className="h-6 w-6" />
                            </div>
                            <span className="text-lg font-medium">Add New Factory</span>
                        </button>
                    } />
                </motion.div>
            </StaggerContainer>
        </div>
    );
}
