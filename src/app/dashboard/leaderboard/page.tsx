"use client";

import React from "react";
import { api } from "@/lib/trpc/react";

function LeaderboardTable() {
    const { data: leaderboard, isLoading } = api.judgments.getLeaderboard.useQuery();

    if (isLoading) {
        return <div>Loading leaderboard...</div>;
    }

    if (!leaderboard?.length) {
        return <div className="text-gray-500">No judgment data available yet.</div>;
    }

    // Sort models by average score in descending order
    const sortedLeaderboard = [...leaderboard].sort((a, b) => b.averageScore - a.averageScore);

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Judgments</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {sortedLeaderboard.map((model, index) => (
                        <tr key={model.modelId} className={index === 0 ? "bg-yellow-50" : ""}>
                            <td className="px-6 py-4">
                                {index + 1}
                                {index === 0 && " 🏆"}
                            </td>
                            <td className="px-6 py-4 font-medium">{model.modelName}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full"
                                            style={{ width: `${(model.averageScore * 100)}%` }}
                                        ></div>
                                    </div>
                                    {model.averageScore.toFixed(3)}
                                </div>
                            </td>
                            <td className="px-6 py-4">{model.totalJudgments}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ModelComparison() {
    const { data: models } = api.models.listModels.useQuery();
    const { data: results } = api.results.listResults.useQuery({
        includeEval: true,
        includeModel: true,
    });
    const { data: judgments } = api.judgments.listJudgments.useQuery({
        includeEval: true,
        includeJudgeModel: true,
    });

    if (!models || !results || !judgments) {
        return null;
    }

    // Calculate success rate for each model
    const modelStats = models.map(model => {
        const modelResults = results.filter(r => r.modelId === model.id);
        const successfulRuns = modelResults.filter(r => !r.errorLog).length;
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
        <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Model Performance</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Runs</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {modelStats.map((stat) => (
                            <tr key={stat.modelId}>
                                <td className="px-6 py-4 font-medium">{stat.modelName}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                                            <div
                                                className="bg-green-600 h-2.5 rounded-full"
                                                style={{ width: `${stat.successRate}%` }}
                                            ></div>
                                        </div>
                                        {stat.successRate.toFixed(1)}%
                                    </div>
                                </td>
                                <td className="px-6 py-4">{stat.totalRuns}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function LeaderboardPage() {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Model Leaderboard</h1>

            {/* Main Leaderboard */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Rankings</h2>
                <LeaderboardTable />
            </div>

            {/* Model Performance Comparison */}
            <ModelComparison />
        </div>
    );
}