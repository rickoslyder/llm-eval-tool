"use client";

import React from "react";
import { api } from "@/lib/trpc/react";
import type { ModelEntity, ResultEntity, EvalEntity } from "@/lib/types";

interface LeaderboardEntry {
    modelId: string;
    modelName: string;
    averageScore: number;
    totalJudgments: number;
}

interface ModelStats {
    modelId: string;
    modelName: string;
    successRate: number;
    totalRuns: number;
}

function LeaderboardTable() {
    const { data: leaderboard, isLoading } = api.judgments.getLeaderboard.useQuery();

    if (isLoading) {
        return <div className="p-4">Loading...</div>;
    }

    if (!leaderboard || leaderboard.length === 0) {
        return <div className="p-4">No judgments found</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Model
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Average Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Judgments
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {leaderboard.map((entry: LeaderboardEntry, index: number) => (
                        <tr key={entry.modelId}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {entry.modelName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                    <span className="mr-2">{entry.averageScore.toFixed(2)}</span>
                                    <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full"
                                            style={{ width: `${entry.averageScore * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {entry.totalJudgments}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ModelComparison() {
    const { data: models } = api.models.listModels.useQuery();
    const { data: results, isLoading: resultsLoading } = api.results.listResults.useQuery({
        includeModel: true,
        includeEval: true
    }) as { data: (ResultEntity & { model: ModelEntity; eval: EvalEntity })[], isLoading: boolean };
    const { data: judgments } = api.judgments.listJudgments.useQuery({
        includeEval: true,
        includeJudgeModel: true,
    });

    if (!models || !results || !judgments) {
        return <div className="p-4">Loading model stats...</div>;
    }

    // Calculate success rate for each model
    const modelStats: ModelStats[] = models.map((model: ModelEntity) => {
        const modelResults = results.filter((r) => r.modelId === model.id);
        const successfulRuns = modelResults.filter((r) => !r.errorLog).length;
        const totalRuns = modelResults.length;
        const successRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0;

        return {
            modelId: model.id,
            modelName: model.name,
            successRate,
            totalRuns,
        };
    });

    return (
        <div className="overflow-x-auto mt-8">
            <h2 className="text-xl font-semibold mb-4">Model Performance Comparison</h2>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Model
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Success Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Runs
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {modelStats.map((stat: ModelStats) => (
                        <tr key={stat.modelId}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {stat.modelName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                    <span className="mr-2">{stat.successRate.toFixed(1)}%</span>
                                    <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-green-600 h-2.5 rounded-full"
                                            style={{ width: `${stat.successRate}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {stat.totalRuns}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function LeaderboardPage() {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Model Leaderboard</h1>
            <LeaderboardTable />
            <ModelComparison />
        </div>
    );
}