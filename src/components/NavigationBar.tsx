"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const routes = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/models", label: "Models" },
    { href: "/dashboard/evals", label: "Evals" },
    { href: "/dashboard/run-evals", label: "Run Evals" },
    { href: "/dashboard/judge-mode", label: "Judge Mode" },
    { href: "/dashboard/leaderboard", label: "Leaderboard" }
];

export default function NavigationBar() {
    const pathname = usePathname();

    return (
        <nav className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/dashboard" className="text-xl font-bold">
                            LLM Eval Tool
                        </Link>
                    </div>
                    <div className="flex space-x-4">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                    pathname === route.href
                                        ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
                                )}
                            >
                                {route.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
} 