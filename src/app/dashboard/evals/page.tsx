"use client";

import React, { FormEvent, ChangeEvent } from "react";
import { api } from "@/lib/trpc/react";
import { toast } from "react-toastify";
import { Eval, EvalMetadata } from "@/lib/types";

function EvalsList() {
    const [filters, setFilters] = React.useState({
        difficulty: "",
        tags: [] as string[],
        creatorModelIds: [] as string[],
        skillsTested: [] as string[],
        estimatedTimeRange: {
            min: undefined as number | undefined,
            max: undefined as number | undefined
        }
    });

    const { data: evals, isLoading } = api.evals.listEvals.useQuery({
        includeCreator: true,
        filters
    }) as { data: Eval[], isLoading: boolean };

    const { data: models } = api.models.listModels.useQuery();

    // Extract unique tags from all evals
    const uniqueTags = React.useMemo(() => {
        if (!evals) return [];
        const tags = new Set<string>();
        evals.forEach(eval_ => {
            eval_.tags?.split(",").forEach(tag => tags.add(tag.trim()));
        });
        return Array.from(tags);
    }, [evals]);

    // Extract unique skills from all evals
    const uniqueSkills = React.useMemo(() => {
        if (!evals) return [];
        const skills = new Set<string>();
        evals.forEach(eval_ => {
            const metadata = eval_.metadata as EvalMetadata;
            metadata?.skillsTested?.forEach(skill => skills.add(skill));
        });
        return Array.from(skills);
    }, [evals]);

    if (isLoading) {
        return <div>Loading evals...</div>;
    }

    if (!evals?.length) {
        return <div className="text-gray-500">No evals generated yet.</div>;
    }

    return (
        <div>
            {/* Enhanced Filters */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <select
                    value={filters.difficulty}
                    onChange={(e) => setFilters(f => ({ ...f, difficulty: e.target.value }))}
                    className="p-2 border rounded"
                >
                    <option value="">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>

                <select
                    multiple
                    value={filters.tags}
                    onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                        setFilters(f => ({ ...f, tags: selected }));
                    }}
                    className="p-2 border rounded"
                >
                    <option value="" disabled>Select Tags</option>
                    {uniqueTags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                    ))}
                </select>

                <select
                    multiple
                    value={filters.skillsTested}
                    onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                        setFilters(f => ({ ...f, skillsTested: selected }));
                    }}
                    className="p-2 border rounded"
                >
                    <option value="" disabled>Select Skills</option>
                    {uniqueSkills.map(skill => (
                        <option key={skill} value={skill}>{skill}</option>
                    ))}
                </select>

                <div className="flex gap-2 items-center">
                    <input
                        type="number"
                        placeholder="Min time"
                        value={filters.estimatedTimeRange.min || ""}
                        onChange={(e) => setFilters(f => ({
                            ...f,
                            estimatedTimeRange: {
                                ...f.estimatedTimeRange,
                                min: e.target.value ? parseInt(e.target.value) : undefined
                            }
                        }))}
                        className="p-2 border rounded w-24"
                    />
                    <span>-</span>
                    <input
                        type="number"
                        placeholder="Max time"
                        value={filters.estimatedTimeRange.max || ""}
                        onChange={(e) => setFilters(f => ({
                            ...f,
                            estimatedTimeRange: {
                                ...f.estimatedTimeRange,
                                max: e.target.value ? parseInt(e.target.value) : undefined
                            }
                        }))}
                        className="p-2 border rounded w-24"
                    />
                    <span className="text-sm text-gray-500">mins</span>
                </div>
            </div>

            {/* Enhanced Evals Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creator Model</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {evals.map((eval_: Eval) => {
                            const metadata = eval_.metadata as EvalMetadata;
                            return (
                                <tr key={eval_.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-pre-wrap">
                                        <div>{eval_.questionText}</div>
                                        {metadata?.expectedFormat && (
                                            <div className="mt-2 text-sm text-gray-500">
                                                Expected Format: {metadata.expectedFormat}
                                            </div>
                                        )}
                                        {metadata?.exampleAnswer && (
                                            <div className="mt-2 text-sm text-gray-500">
                                                Example Answer: {metadata.exampleAnswer}
                                            </div>
                                        )}
                                        {metadata?.validationCriteria && (
                                            <div className="mt-2 text-sm text-gray-500">
                                                Validation Criteria:
                                                <ul className="list-disc list-inside">
                                                    {metadata.validationCriteria.map((criterion, i) => (
                                                        <li key={i}>{criterion}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">{eval_.creatorModel?.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-sm ${eval_.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                            eval_.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                eval_.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {eval_.difficulty || 'unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {eval_.tags?.split(",").map((tag, i) => (
                                                <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                                    {tag.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {metadata?.skillsTested?.map((skill, i) => (
                                                <span key={i} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {metadata?.estimatedTimeMinutes ? `${metadata.estimatedTimeMinutes} mins` : '-'}
                                    </td>
                                    <td className="px-6 py-4">{new Date(eval_.createdAt).toLocaleString()}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
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

    const [options, setOptions] = React.useState({
        temperature: 0.7,
        maxTokens: 1000,
        numberOfQuestions: 1
    });

    async function handleGenerate(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (selectedModelIds.length === 0) {
            toast.error("Please select at least one model");
            return;
        }
        if (!prompt.trim()) {
            toast.error("Please enter a prompt");
            return;
        }

        toast.info("Generating evals... This may take a moment.");
        await generateEvalsMutation.mutateAsync({
            prompt,
            modelIds: selectedModelIds,
            options
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
                    <p className="mt-1 text-sm text-gray-500">
                        The master prompt should describe the type of questions you want to generate.
                        Be specific about the skills or capabilities you want to test.
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
                        Hold Ctrl/Cmd to select multiple models. Each selected model will generate its own evaluation.
                    </p>
                </div>

                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Temperature
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="2"
                            step="0.1"
                            value={options.temperature}
                            onChange={(e) => setOptions(o => ({ ...o, temperature: parseFloat(e.target.value) }))}
                            className="w-full p-2 border rounded"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            Higher values make output more random (0-2)
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Max Tokens
                        </label>
                        <input
                            type="number"
                            min="100"
                            max="4000"
                            step="100"
                            value={options.maxTokens}
                            onChange={(e) => setOptions(o => ({ ...o, maxTokens: parseInt(e.target.value) }))}
                            className="w-full p-2 border rounded"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            Maximum length of generated text (100-4000)
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Number of Questions
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={options.numberOfQuestions}
                            onChange={(e) => setOptions(o => ({ ...o, numberOfQuestions: parseInt(e.target.value) }))}
                            className="w-full p-2 border rounded"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            Questions to generate per model (1-10)
                        </p>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={generateEvalsMutation.isPending}
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                    {generateEvalsMutation.isPending ? "Generating..." : "Generate Evals"}
                </button>
            </form>

            <div className="mt-12">
                <h2 className="text-xl font-semibold mb-4">Generated Evals</h2>
                <EvalsList />
            </div>
        </div>
    );
} 