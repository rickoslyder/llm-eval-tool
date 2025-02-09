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

export default function RunEvalsPage() {
    const { data: evals } = api.evals.listEvals.useQuery();
    const { data: models } = api.model.listModels.useQuery();
    const runEvalMutation = api.evals.runEval.useMutation({
        onSuccess: () => {
            toast.success("Eval run completed successfully!");
            setSelectedEvalId("");
            setSelectedModelIds([]);
        },
    });

    const [selectedEvalId, setSelectedEvalId] = useState("");
    const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);

    async function handleRun() {
        if (!selectedEvalId) {
            toast.error("Please select an eval");
            return;
        }
        if (selectedModelIds.length === 0) {
            toast.error("Please select at least one model");
            return;
        }

        try {
            await runEvalMutation.mutateAsync({
                evalId: selectedEvalId,
                modelIds: selectedModelIds,
            });
        } catch (error) {
            toast.error("Failed to run eval");
        }
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Run Evals</h1>
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
                    <label className="block text-sm font-medium mb-2">Select Models to Run</label>
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

                <Button
                    onClick={handleRun}
                    disabled={runEvalMutation.status === "pending"}
                    className="w-full"
                >
                    {runEvalMutation.status === "pending" ? "Running..." : "Run Eval"}
                </Button>
            </div>
        </div>
    );
} 