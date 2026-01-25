import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import path from 'path';

export const MEMO_DIR = path.join(process.cwd(), 'data');

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
