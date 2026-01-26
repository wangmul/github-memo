"use client";

import { cn } from "@/lib/utils";
import { Copy, FileText, GitBranch, Github, Plus, RefreshCw, Save, Settings, AlertCircle, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Memo, GitStatus } from "@/types";
import { format } from "date-fns";
import { ConfirmModal } from "./ConfirmModal";
import { SwipeableMemoItem } from "./SwipeableMemoItem";

interface SidebarProps {
    memos: Memo[];
    currentSlug: string | null;
    onSelect: (slug: string) => void;
    onCreate: () => void;
    onDelete: (slug: string) => void;
    onSync: () => void;
    gitStatus: GitStatus | null;
    onOpenSettings: () => void;
    onOpenIssues: () => void;
    className?: string;
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ memos, currentSlug, onSelect, onCreate, onDelete, onSync, gitStatus, onOpenSettings, onOpenIssues, className, isOpen, onClose }: SidebarProps) {
    const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-xl flex flex-col h-full transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full",
                className
            )}>
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-100 font-bold">
                        <Github className="w-5 h-5" />
                        <span>GH Memo</span>
                    </div>
                    <button
                        onClick={() => {
                            onCreate();
                            onClose();
                        }}
                        className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors"
                        title="New Memo"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {memos.map((memo) => (
                        <SwipeableMemoItem
                            key={memo.slug}
                            memo={memo}
                            currentSlug={currentSlug}
                            onSelect={onSelect}
                            onDelete={(slug) => setDeletingSlug(slug)} // Open modal on delete
                            onCloseSidebar={onClose}
                        />
                    ))}
                </div>

                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2">
                        <span>Git Status</span>
                        {gitStatus && (
                            <span className={cn("w-2 h-2 rounded-full", (gitStatus.modified.length > 0 || gitStatus.not_added.length > 0) ? "bg-amber-500" : "bg-green-500")} />
                        )}
                    </div>

                    <button
                        onClick={onSync}
                        className="w-full flex items-center justify-between px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                        <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Sync</span>
                    </button>

                    <button
                        onClick={onOpenIssues}
                        className="w-full flex items-center justify-between px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                        <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Issues</span>
                    </button>

                    <button
                        onClick={onOpenSettings}
                        className="w-full flex items-center justify-between px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                        <span className="flex items-center gap-2"><Settings className="w-4 h-4" /> Settings</span>
                    </button>
                </div>
            </aside>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deletingSlug}
                onClose={() => setDeletingSlug(null)}
                onConfirm={() => {
                    if (deletingSlug) {
                        onDelete(deletingSlug);
                        setDeletingSlug(null);
                    }
                }}
                title="Delete Memo?"
                description="This action cannot be undone. This will permanently delete the memo from your local device and GitHub repository."
                confirmText="Delete permanently"
                isDangerous={true}
            />
        </>
    );
}
