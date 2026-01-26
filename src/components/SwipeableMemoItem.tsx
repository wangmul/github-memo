"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Memo } from "@/types";

interface SwipeableMemoItemProps {
    memo: Memo;
    currentSlug: string | null;
    onSelect: (slug: string) => void;
    onDelete: (slug: string) => void;
    onCloseSidebar: () => void;
}

export function SwipeableMemoItem({ memo, currentSlug, onSelect, onDelete, onCloseSidebar }: SwipeableMemoItemProps) {
    const [startX, setStartX] = useState<number | null>(null);
    const [currentX, setCurrentX] = useState<number | null>(null);
    const [isSwiped, setIsSwiped] = useState(false);
    const itemRef = useRef<HTMLDivElement>(null);

    // Reset swipe state when selecting another memo or clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (itemRef.current && !itemRef.current.contains(event.target as Node)) {
                setIsSwiped(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // Extract title/preview
    const lines = memo.content.split('\n').filter(line => line.trim() !== '');
    const title = lines[0]?.replace(/^#+\s*/, '') || memo.slug;
    const preview = lines.slice(1).find(l => l.trim() !== '') || "No additional text";

    const handleTouchStart = (e: React.TouchEvent) => {
        setStartX(e.touches[0].clientX);
        setCurrentX(e.touches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (startX === null) return;
        const x = e.touches[0].clientX;
        const diff = startX - x;

        // Only track left swipes
        if (diff > 0) {
            setCurrentX(x);
        }
    };

    const handleTouchEnd = () => {
        if (startX === null || currentX === null) return;

        const diff = startX - currentX;
        const threshold = 50; // px to trigger swipe

        if (diff > threshold) {
            setIsSwiped(true);
        } else {
            setIsSwiped(false);
        }

        setStartX(null);
        setCurrentX(null);
    };

    const offset = startX !== null && currentX !== null
        ? Math.min(Math.max(startX - currentX, 0), 100) // Cap drag at 100px
        : isSwiped ? 80 : 0;

    return (
        <div className="relative overflow-hidden group rounded-lg mb-1" ref={itemRef}>
            {/* Background Action Layer (Red Delete) */}
            <div className="absolute inset-y-0 right-0 flex items-center justify-end w-full bg-red-500 rounded-lg pr-4">
                <Trash2 className="w-5 h-5 text-white" />
            </div>

            {/* Foreground Content Layer */}
            <div
                className={cn(
                    "relative w-full text-left px-3 py-3 rounded-lg text-sm transition-transform duration-200 ease-out bg-zinc-50 dark:bg-zinc-900 border border-transparent",
                    currentSlug === memo.slug
                        ? "bg-white dark:bg-zinc-800 shadow-sm border-zinc-200 dark:border-zinc-700"
                        : "hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50",
                    isSwiped ? "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800" : "" // Ensure contrast when swiped
                )}
                style={{ transform: `translateX(-${offset}px)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={() => {
                    if (isSwiped) {
                        setIsSwiped(false); // Close if tapping on swiped content
                    } else {
                        onSelect(memo.slug);
                        onCloseSidebar();
                    }
                }}
            >
                <div className={cn(
                    "font-medium truncate w-full pr-2",
                    currentSlug === memo.slug ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-700 dark:text-zinc-300"
                )}>
                    {title}
                </div>
                <div className="text-xs text-zinc-500 truncate w-full flex items-center gap-1">
                    <span className="opacity-75">{format(new Date(), "MM/dd")}</span>
                    <span>·</span>
                    <span>{preview}</span>
                </div>
            </div>

            {/* Invisible Hit Area for Delete Button (When swiped) */}
            {isSwiped && (
                <button
                    className="absolute inset-y-0 right-0 w-[80px] z-10 flex items-center justify-center"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(memo.slug);
                        setIsSwiped(false);
                    }}
                    aria-label="Delete"
                />
            )}

            {/* Desktop Hover Delete (Keep existing functionality) */}
            {!isSwiped && (
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(memo.slug);
                    }}
                    className="absolute right-2 top-3 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-red-500 transition-all z-20 hidden md:block"
                    title="Delete"
                >
                    <Trash2 className="w-4 h-4" />
                </div>
            )}
        </div>
    );
}
