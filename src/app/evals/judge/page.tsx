"use client";

import React, { useState } from "react";
import { api } from "@/lib/trpc/react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

type Model = {
    id: string;
    name: string;
    baseUrl: string;
    apiKey: string;
    createdAt: Date;
};

type Eval = {
    id: string;
    questionText: string;
    creatorModelId: string;
    creatorModel: Model;
    createdAt: Date;
};

export default function JudgeEvalsPage() {
    const { data: evals } = api.evals.listEvals.useQuery();
    const { data: models } = api.model.listModels.useQuery();
    const judgeEvalMutation = api.evals.judgeEval.useMutation({
        onSuccess: () => {
            toast.success("Eval judged successfully!");
            setSelectedEvalId("");
            setSelectedModelIds([]);
        },
    });

    const [selectedEvalId, setSelectedEvalId] = useState("");
    const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
    const [ratingMin, setRatingMin] = useState(1);
    const [ratingMax, setRatingMax] = useState(10);

    async function handleJudge() {
        if (!selectedEvalId) {
            toast.error("Please select an eval");
            return;
        }
        if (selectedModelIds.length === 0) {
            toast.error("Please select at least one model");
            return;
        }
        if (ratingMin >= ratingMax) {
            toast.error("Minimum rating must be less than maximum rating");
            return;
        }

        try {
            await judgeEvalMutation.mutateAsync({
                evalId: selectedEvalId,
                modelIds: selectedModelIds,
                ratingScaleMin: ratingMin,
                ratingScaleMax: ratingMax,
            });
        } catch (error) {
            toast.error("Failed to judge eval");
        }
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Judge Evals</h1>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Select Eval</label>
                    <select
                        value={selectedEvalId}
                        onChange={(e) => setSelectedEvalId(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                    >
                        <option value="">--Choose--</option>
                        {evals?.map((ev: Eval) => (
                            <option key={ev.id} value={ev.id}>
                                {ev.questionText} (by {ev.creatorModel.name})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Select Judge Models</label>
                    <div className="space-y-2">
                        {models?.map((m: Model) => (
                            <label key={m.id} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selectedModelIds.includes(m.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedModelIds((prev) => [...prev, m.id]);
                                        } else {
                                            setSelectedModelIds((prev) =>
                                                prev.filter((id) => id !== m.id)
                                            );
                                        }
                                    }}
                                    className="rounded border-gray-300"
                                />
                                <span>{m.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Rating Min</label>
                        <input
                            type="number"
                            value={ratingMin}
                            onChange={(e) => setRatingMin(Number(e.target.value))}
                            className="w-24 p-2 border rounded-lg"
                            min={1}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Rating Max</label>
                        <input
                            type="number"
                            value={ratingMax}
                            onChange={(e) => setRatingMax(Number(e.target.value))}
                            className="w-24 p-2 border rounded-lg"
                            min={1}
                        />
                    </div>
                </div>

                <Button
                    onClick={handleJudge}
                    disabled={judgeEvalMutation.status === "pending"}
                    className="w-full"
                >
                    {judgeEvalMutation.status === "pending" ? "Judging..." : "Judge Eval"}
                </Button>
            </div>
        </div>
    );
} 