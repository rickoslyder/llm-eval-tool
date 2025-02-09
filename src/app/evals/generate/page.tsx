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

export default function GenerateEvalsPage() {
    const [prompt, setPrompt] = useState("");
    const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
    const { data: models } = api.model.listModels.useQuery();
    const generateEvalsMutation = api.evals.generateEvals.useMutation({
        onSuccess: () => {
            toast.success("Evals generated successfully!");
            setPrompt("");
            setSelectedModelIds([]);
        },
    });

    async function handleGenerate() {
        if (!prompt.trim()) {
            toast.error("Please enter a prompt");
            return;
        }
        if (selectedModelIds.length === 0) {
            toast.error("Please select at least one model");
            return;
        }

        try {
            await generateEvalsMutation.mutateAsync({
                prompt,
                modelIds: selectedModelIds,
            });
        } catch (error) {
            toast.error("Failed to generate evals");
        }
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Generate Evals</h1>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Prompt</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter a prompt..."
                        className="w-full p-2 border rounded-lg min-h-[100px]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Select Models</label>
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
                    onClick={handleGenerate}
                    disabled={generateEvalsMutation.status === "pending"}
                    className="w-full"
                >
                    {generateEvalsMutation.status === "pending" ? "Generating..." : "Generate Evals"}
                </Button>
            </div>
        </div>
    );
} 