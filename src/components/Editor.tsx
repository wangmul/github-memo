"use client";


import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface EditorProps {
    content: string;
    slug: string;
    onChange: (content: string) => void;
    onSave: () => void;
}

export function Editor({ content, slug, onChange, onSave }: EditorProps) {
    // Debounce auto-save
    useEffect(() => {
        const handler = setTimeout(() => {
            if (content) { // Do not save empty content automatically or maybe we should? for sync.
                onSave();
            }
        }, 2000); // 2 seconds debounce

        return () => {
            clearTimeout(handler);
        };
    }, [content, onSave]);

    return (
        <div className="h-full flex flex-col bg-white dark:bg-zinc-950">
            <div className="border-b border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm z-10 sticky top-0">
                <h1 className="text-xl font-bold font-sans tracking-tight">{slug}</h1>
                <div className="text-xs text-zinc-400">
                    {content.length} characters
                    <span className="ml-2 inline-flex relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
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
