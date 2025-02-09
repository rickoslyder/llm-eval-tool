"use client";

import React, { FormEvent, ChangeEvent } from "react";
import { api } from "@/lib/trpc/react";
import { toast } from "react-toastify";

function EvalsList() {
    const { data: evals, isLoading } = api.evals.listEvals.useQuery({
        includeCreator: true,
    });

    if (isLoading) {
        return <div>Loading evals...</div>;
    }

    if (!evals?.length) {
        return <div className="text-gray-500">No evals generated yet.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creator Model</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {evals.map((eval_) => (
                        <tr key={eval_.id}>
                            <td className="px-6 py-4 whitespace-pre-wrap">{eval_.questionText}</td>
                            <td className="px-6 py-4">{eval_.creatorModel?.name}</td>
                            <td className="px-6 py-4">{new Date(eval_.createdAt).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function EvalsPage() {
    const utils = api.useUtils();
    const { data: models, isLoading: modelsLoading } = api.models.listModels.useQuery();
    const generateEvalsMutation = api.evals.generateEvals.useMutation({
        onSuccess: () => {
            toast.success("Evals generated successfully");
            utils.evals.listEvals.invalidate();
            setPrompt("");
            setSelectedModelIds([]);
        },
        onError: (error) => {
            toast.error(`Error generating evals: ${error.message}`);
        },
    });

    const [prompt, setPrompt] = React.useState("");
    const [selectedModelIds, setSelectedModelIds] = React.useState<string[]>([]);

    async function handleGenerate(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (selectedModelIds.length === 0) {
            toast.error("Please select at least one model");
            return;
        }
        await generateEvalsMutation.mutateAsync({
            prompt,
            modelIds: selectedModelIds,
        });
    }

    function handleModelSelect(e: ChangeEvent<HTMLSelectElement>) {
        const options = e.target.options;
        const values: string[] = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                values.push(options[i].value);
            }
        }
        setSelectedModelIds(values);
    }

    if (modelsLoading) {
        return <div className="p-4">Loading models...</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Generate Evals</h1>
            <form onSubmit={handleGenerate} className="max-w-2xl">
                <div className="mb-6">
                    <label htmlFor="prompt" className="block text-sm font-medium mb-2">
                        Master Prompt
                    </label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full h-32 p-3 border rounded-lg resize-none"
                        placeholder="Enter a master prompt for generating evaluations..."
                        required
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="models" className="block text-sm font-medium mb-2">
                        Select Models
                    </label>
                    <select
                        id="models"
                        multiple
                        value={selectedModelIds}
                        onChange={handleModelSelect}
                        className="w-full p-3 border rounded-lg"
                        size={5}
                    >
                        {models?.map((model) => (
                            <option key={model.id} value={model.id}>
                                {model.name}
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-sm text-gray-500">
                        Hold Ctrl/Cmd to select multiple models
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={generateEvalsMutation.isPending}
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                    {generateEvalsMutation.isPending ? "Generating..." : "Generate Evals"}
                </button>
            </form>

            {/* Display existing evals */}
            <div className="mt-12">
                <h2 className="text-xl font-semibold mb-4">Generated Evals</h2>
                <EvalsList />
            </div>
        </div>
    );
} 