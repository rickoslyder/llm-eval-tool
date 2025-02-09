"use client";

import React from "react";
import { api } from "@/lib/trpc/react";

export default function LeaderboardPage() {
    const { data: stats } = api.evals.getLeaderboard.useQuery();

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>
            <div className="space-y-4">
                {stats ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                            <div className="text-sm text-gray-600">Total Results</div>
                            <div className="text-2xl font-bold">{stats.totalResults}</div>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <div className="text-sm text-gray-600">Total Judgments</div>
                            <div className="text-2xl font-bold">{stats.totalJudgments}</div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-600">Loading...</div>
                )}
            </div>
        </div>
    );
} 