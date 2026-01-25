"use client";

import { Textarea } from "@/components/ui/textarea"; // Assuming we have or will create this, or use standard
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface EditorProps {
    content: string;
    slug: string;
    onChange: (content: string) => void;
    onSave: () => void;
}

export function Editor({ content, slug, onChange, onSave }: EditorProps) {
    // Auto-save debounce effect could be here

    return (
        <div className="h-full flex flex-col bg-white dark:bg-zinc-950">
            <div className="border-b border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm z-10 sticky top-0">
                <h1 className="text-xl font-bold font-sans tracking-tight">{slug}</h1>
                <div className="text-xs text-zinc-400">
                    {content.length} characters
                </div>
            </div>
            <div className="flex-1 relative">
                <textarea
                    value={content}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-full p-8 resize-none focus:outline-none bg-transparent font-sans text-lg leading-relaxed text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                    placeholder="Write your thoughts here..."
                    spellCheck={false}
                />
            </div>
        </div>
    );
}
