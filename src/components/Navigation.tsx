"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Home" },
        { href: "/models", label: "Models" },
        { href: "/evals/generate", label: "Generate Evals" },
        { href: "/evals/run", label: "Run Evals" },
        { href: "/evals/judge", label: "Judge Evals" },
        { href: "/leaderboard", label: "Leaderboard" },
    ];

    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex flex-wrap gap-4">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === link.href
                            ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
                            }`}
                    >
                        {link.label}
                    </Link>
                ))}
            </div>
        </nav>
    );
} 