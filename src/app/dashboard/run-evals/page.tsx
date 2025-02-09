"use client";

import React, { FormEvent } from "react";
import { api } from "@/lib/trpc/react";
import { toast } from "react-toastify";

function ResultsList() {
    const { data: results, isLoading } = api.results.listResults.useQuery({
        includeEval: true,
        includeModel: true,
    });

    if (isLoading) {
        return <div>Loading results...</div>;
    }

    if (!results?.length) {
        return <div className="text-gray-500">No results yet.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {results.map((result) => (
                        <tr key={result.id}>
                            <td className="px-6 py-4 whitespace-pre-wrap">{result.eval?.questionText}</td>
                            <td className="px-6 py-4">{result.model?.name}</td>
                            <td className="px-6 py-4 whitespace-pre-wrap">{result.responseText || "No response"}</td>
                            <td className="px-6 py-4">
                                {result.errorLog ? (
                                    <span className="text-red-500">Failed</span>
                                ) : (
                                    <span className="text-green-500">Success</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function RunEvalsPage() {
    const utils = api.useUtils();
    const { data: evals, isLoading: evalsLoading } = api.evals.listEvals.useQuery();
    const { data: models, isLoading: modelsLoading } = api.models.listModels.useQuery();
    const runEvalMutation = api.results.runEval.useMutation({
        onSuccess: () => {
            toast.success("Eval run completed successfully");
            utils.results.listResults.invalidate();
        },
        onError: (error) => {
            toast.error(`Error running eval: ${error.message}`);
        },
    });

    const [selectedEvalIds, setSelectedEvalIds] = React.useState<string[]>([]);
    const [selectedModelIds, setSelectedModelIds] = React.useState<string[]>([]);

    async function handleRunEvals(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (selectedEvalIds.length === 0) {
            toast.error("Please select at least one eval");
            return;
        }
        if (selectedModelIds.length === 0) {
            toast.error("Please select at least one model");
            return;
        }

        try {
            const tasks = [];
            for (const evalId of selectedEvalIds) {
                for (const modelId of selectedModelIds) {
                    tasks.push(runEvalMutation.mutateAsync({ evalId, modelId }));
                }
            }
            await Promise.all(tasks);
        } catch (error) {
            // Error is already handled by the mutation
        }
    }

    if (evalsLoading || modelsLoading) {
        return <div className="p-4">Loading...</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Run Evals</h1>
            <form onSubmit={handleRunEvals} className="max-w-2xl">
                <div className="mb-6">
                    <label htmlFor="evals" className="block text-sm font-medium mb-2">
                        Select Evals
                    </label>
                    <select
                        id="evals"
                        multiple
                        value={selectedEvalIds}
                        onChange={(e) => {
                            const options = e.target.options;
                            const values = [];
                            for (let i = 0; i < options.length; i++) {
                                if (options[i].selected) {
                                    values.push(options[i].value);
                                }
                            }
                            setSelectedEvalIds(values);
                        }}
                        className="w-full p-3 border rounded-lg"
                        size={5}
                    >
                        {evals?.map((eval_) => (
                            <option key={eval_.id} value={eval_.id}>
                                {eval_.questionText}
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-sm text-gray-500">
                        Hold Ctrl/Cmd to select multiple evals
                    </p>
                </div>

                <div className="mb-6">
                    <label htmlFor="models" className="block text-sm font-medium mb-2">
                        Select Models
                    </label>
                    <select
                        id="models"
                        multiple
                        value={selectedModelIds}
                        onChange={(e) => {
                            const options = e.target.options;
                            const values = [];
                            for (let i = 0; i < options.length; i++) {
                                if (options[i].selected) {
                                    values.push(options[i].value);
                                }
                            }
                            setSelectedModelIds(values);
                        }}
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
                    disabled={runEvalMutation.isPending}
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                    {runEvalMutation.isPending ? "Running..." : "Run Evals"}
                </button>
            </form>

            {/* Display results */}
            <div className="mt-12">
                <h2 className="text-xl font-semibold mb-4">Results</h2>
                <ResultsList />
            </div>
        </div>
    );
} 