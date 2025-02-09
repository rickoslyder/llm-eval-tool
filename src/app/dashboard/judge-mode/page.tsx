"use client";

import React, { FormEvent } from "react";
import { api } from "@/lib/trpc/react";
import { toast } from "react-toastify";
import type { JudgmentEntity } from "@/lib/types";

function JudgmentsList() {
    const { data: judgments, isLoading } = api.judgments.listJudgments.useQuery({
        includeEval: true,
        includeJudgeModel: true,
    });

    if (isLoading) {
        return <div>Loading judgments...</div>;
    }

    if (!judgments?.length) {
        return <div className="text-gray-500">No judgments yet.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judge Model</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Justification</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {judgments.map((judgment: JudgmentEntity) => (
                        <tr key={judgment.id}>
                            <td className="px-6 py-4 whitespace-pre-wrap">{judgment.eval?.questionText}</td>
                            <td className="px-6 py-4">{judgment.judgeModel?.name}</td>
                            <td className="px-6 py-4">{judgment.score.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-pre-wrap">{judgment.justificationText}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function JudgeModePage() {
    const utils = api.useUtils();
    const { data: evals, isLoading: evalsLoading } = api.evals.listEvals.useQuery();
    const { data: models, isLoading: modelsLoading } = api.models.listModels.useQuery();
    const judgeEvalsMutation = api.judgments.judgeEvals.useMutation({
        onSuccess: () => {
            toast.success("Judgments completed successfully");
            utils.judgments.listJudgments.invalidate();
            setSelectedEvalIds([]);
            setSelectedJudgeModelId("");
        },
        onError: (error) => {
            toast.error(`Error creating judgments: ${error.message}`);
        },
    });

    const [selectedEvalIds, setSelectedEvalIds] = React.useState<string[]>([]);
    const [selectedJudgeModelId, setSelectedJudgeModelId] = React.useState<string>("");

    async function handleJudge(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (selectedEvalIds.length === 0) {
            toast.error("Please select at least one eval");
            return;
        }
        if (!selectedJudgeModelId) {
            toast.error("Please select a judge model");
            return;
        }

        await judgeEvalsMutation.mutateAsync({
            evalIds: selectedEvalIds,
            judgeModelId: selectedJudgeModelId,
        });
    }

    if (evalsLoading || modelsLoading) {
        return <div className="p-4">Loading...</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Judge Mode</h1>
            <form onSubmit={handleJudge} className="max-w-2xl">
                <div className="mb-6">
                    <label htmlFor="evals" className="block text-sm font-medium mb-2">
                        Select Evals to Judge
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
                    <label htmlFor="judgeModel" className="block text-sm font-medium mb-2">
                        Select Judge Model
                    </label>
                    <select
                        id="judgeModel"
                        value={selectedJudgeModelId}
                        onChange={(e) => setSelectedJudgeModelId(e.target.value)}
                        className="w-full p-3 border rounded-lg"
                        required
                    >
                        <option value="">Select a model...</option>
                        {models?.map((model) => (
                            <option key={model.id} value={model.id}>
                                {model.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={judgeEvalsMutation.isPending}
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                    {judgeEvalsMutation.isPending ? "Judging..." : "Judge Evals"}
                </button>
            </form>

            {/* Display judgments */}
            <div className="mt-12">
                <h2 className="text-xl font-semibold mb-4">Judgments</h2>
                <JudgmentsList />
            </div>
        </div>
    );
} 