"use client";

import React, { FormEvent, ChangeEvent, useEffect } from "react";
import { api } from "@/lib/trpc/react";
import { toast } from "react-toastify";

const modelProviders = {
    OpenAI: {
        baseUrl: "https://api.openai.com/v1",
        models: [
            // Latest Models
            { displayName: "GPT-4o (Latest)", modelId: "gpt-4o" },
            { displayName: "GPT-4o Mini (Latest)", modelId: "gpt-4o-mini" },
            { displayName: "o1 (Latest)", modelId: "o1" },
            { displayName: "o1 Mini (Latest)", modelId: "o1-mini" },
            { displayName: "o3 Mini (Latest)", modelId: "o3-mini" },

            // Preview Models
            { displayName: "o1 Preview", modelId: "o1-preview" },
            { displayName: "GPT-4o Realtime Preview", modelId: "gpt-4o-realtime-preview" },
            { displayName: "GPT-4o Mini Realtime Preview", modelId: "gpt-4o-mini-realtime-preview" },
            { displayName: "GPT-4o Audio Preview", modelId: "gpt-4o-audio-preview" },

            // Specific Versions
            { displayName: "GPT-4o (2024-08-06)", modelId: "gpt-4o-2024-08-06" },
            { displayName: "GPT-4o Mini (2024-07-18)", modelId: "gpt-4o-mini-2024-07-18" },
            { displayName: "o1 (2024-12-17)", modelId: "o1-2024-12-17" },
            { displayName: "o1 Mini (2024-09-12)", modelId: "o1-mini-2024-09-12" },
            { displayName: "o3 Mini (2025-01-31)", modelId: "o3-mini-2025-01-31" },
            { displayName: "o1 Preview (2024-09-12)", modelId: "o1-preview-2024-09-12" },
            { displayName: "GPT-4o Realtime Preview (2024-12-17)", modelId: "gpt-4o-realtime-preview-2024-12-17" },
            { displayName: "GPT-4o Mini Realtime Preview (2024-12-17)", modelId: "gpt-4o-mini-realtime-preview-2024-12-17" },
            { displayName: "GPT-4o Audio Preview (2024-12-17)", modelId: "gpt-4o-audio-preview-2024-12-17" }
        ]
    },
    Gemini: {
        baseUrl: "https://generativelanguage.googleapis.com/v1",
        models: [
            { displayName: "Gemini 2.0 Flash", modelId: "gemini-2.0-flash" },
            { displayName: "Gemini 2.0 Flash-Lite", modelId: "gemini-2.0-flash-lite-preview-02-05" },
            { displayName: "Gemini 1.5 Flash", modelId: "gemini-1.5-flash" },
            { displayName: "Gemini 1.5 Flash-8B", modelId: "gemini-1.5-flash-8b" },
            { displayName: "Gemini 1.5 Pro", modelId: "gemini-1.5-pro" },
            // Experimental Models
            { displayName: "Gemini 2.0 Pro (Experimental)", modelId: "gemini-2.0-pro-exp-02-05" },
            { displayName: "Gemini 2.0 Flash Thinking (Experimental)", modelId: "gemini-2.0-flash-thinking-exp-01-21" },
            { displayName: "Gemini 2.0 Flash (Experimental)", modelId: "gemini-2.0-flash-exp" },
            { displayName: "Gemini (Experimental)", modelId: "gemini-exp-1206" },
            { displayName: "LearnLM 1.5 Pro (Experimental)", modelId: "learnlm-1.5-pro-experimental" }
        ]
    },
    Anthropic: {
        baseUrl: "https://api.anthropic.com/v1",
        models: [
            // Claude 3.5 Series (Latest)
            { displayName: "Claude 3.5 Sonnet (Latest) - Most Intelligent", modelId: "claude-3-5-sonnet-20241022" },
            { displayName: "Claude 3.5 Haiku (Latest) - Fastest", modelId: "claude-3-5-haiku-20241022" },
            // Claude 3 Series
            { displayName: "Claude 3 Opus - Complex Tasks", modelId: "claude-3-opus-20240229" },
            { displayName: "Claude 3 Sonnet - Balanced", modelId: "claude-3-sonnet-20240229" },
            { displayName: "Claude 3 Haiku - Fast & Compact", modelId: "claude-3-haiku-20240307" }
        ]
    },
    Mistral: {
        baseUrl: "https://api.mistral.ai/v1",
        models: [
            // Premier Models
            { displayName: "Mistral Large (Latest) - Top-tier Reasoning", modelId: "mistral-large-latest" },
            { displayName: "Pixtral Large - Multimodal", modelId: "pixtral-large-latest" },
            { displayName: "Ministral 8B - Edge Computing", modelId: "ministral-8b-latest" },
            { displayName: "Codestral (Latest) - Code Specialist", modelId: "codestral-latest" },
            { displayName: "Mistral Embed - Text Embeddings", modelId: "mistral-embed" },
            { displayName: "Mistral Moderation - Content Safety", modelId: "mistral-moderation-latest" },
            // Free Models
            { displayName: "Mistral Small v3 (Latest)", modelId: "mistral-small-latest" },
            { displayName: "Pixtral 12B - Image Understanding", modelId: "pixtral-12b-2409" },
            // Research Models
            { displayName: "Mistral Nemo - Multilingual", modelId: "open-mistral-nemo" },
            { displayName: "Codestral Mamba - State Space Model", modelId: "open-codestral-mamba" }
        ]
    },
    DeepSeek: {
        baseUrl: "https://api.deepseek.com/v1",
        models: [
            { displayName: "DeepSeek R1", modelId: "deepseek-reasoner" },
            { displayName: "DeepSeek V2.5", modelId: "deepseek-chat" },
            { displayName: "DeepSeek Code V2.5", modelId: "deepseek-coder" }
        ]
    },
    OpenRouter: {
        baseUrl: "https://openrouter.ai/api/v1",
        models: []
    }
};

function AddModelForm() {
    const utils = api.useUtils();
    const createModelMutation = api.models.createModel.useMutation({
        onSuccess: () => {
            toast.success("Model created successfully");
            utils.models.listModels.invalidate();
            setSelectedProvider("");
            setSelectedModel("");
            setDisplayName("");
            setModelId("");
            setBaseUrl("");
            setApiKey("");
        },
        onError: (error) => {
            toast.error(`Error creating model: ${error.message}`);
        },
    });

    const [selectedProvider, setSelectedProvider] = React.useState("");
    const [selectedModel, setSelectedModel] = React.useState("");
    const [displayName, setDisplayName] = React.useState("");
    const [modelId, setModelId] = React.useState("");
    const [baseUrl, setBaseUrl] = React.useState("");
    const [apiKey, setApiKey] = React.useState("");
    const [isCustomModel, setIsCustomModel] = React.useState(false);
    const [openRouterModels, setOpenRouterModels] = React.useState<Array<{
        id: string;
        name: string;
        description: string;
    }>>([]);
    const [isLoadingModels, setIsLoadingModels] = React.useState(false);

    useEffect(() => {
        async function fetchOpenRouterModels() {
            if (selectedProvider === "OpenRouter") {
                setIsLoadingModels(true);
                try {
                    const response = await fetch("https://openrouter.ai/api/v1/models");
                    const data = await response.json();
                    setOpenRouterModels(data.data || []);
                } catch (error) {
                    console.error("Failed to fetch OpenRouter models:", error);
                    toast.error("Failed to load OpenRouter models");
                } finally {
                    setIsLoadingModels(false);
                }
            }
        }

        fetchOpenRouterModels();
    }, [selectedProvider]);

    function handleProviderChange(e: ChangeEvent<HTMLSelectElement>) {
        const provider = e.target.value;
        setSelectedProvider(provider);
        setSelectedModel("");
        setDisplayName("");
        setModelId("");
        setBaseUrl(provider ? modelProviders[provider as keyof typeof modelProviders].baseUrl : "");
        setIsCustomModel(false);
    }

    function handleModelChange(e: ChangeEvent<HTMLSelectElement>) {
        const modelId = e.target.value;
        if (modelId === "custom") {
            setIsCustomModel(true);
            setDisplayName("");
            setModelId("");
            return;
        }

        if (selectedProvider === "OpenRouter") {
            const model = openRouterModels.find(m => m.id === modelId);
            if (model) {
                setDisplayName(model.name);
                setModelId(model.id);
                setIsCustomModel(false);
            }
            return;
        }

        const provider = modelProviders[selectedProvider as keyof typeof modelProviders];
        const model = provider.models.find(m => m.modelId === modelId);
        if (model) {
            setDisplayName(model.displayName);
            setModelId(model.modelId);
            setIsCustomModel(false);
        }
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        await createModelMutation.mutateAsync({
            name: displayName,
            modelId: modelId,
            baseUrl: baseUrl,
            apiKey: apiKey
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="provider" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Provider
                    </label>
                    <select
                        id="provider"
                        onChange={handleProviderChange}
                        value={selectedProvider}
                        className="w-full p-2.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Select a Provider</option>
                        {Object.keys(modelProviders).map((provider) => (
                            <option key={provider} value={provider}>
                                {provider}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedProvider && (
                    <div>
                        <label htmlFor="model" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Model
                        </label>
                        <select
                            id="model"
                            onChange={handleModelChange}
                            value={selectedModel}
                            className="w-full p-2.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select a Model</option>
                            {selectedProvider === "OpenRouter" ? (
                                isLoadingModels ? (
                                    <option value="" disabled>Loading models...</option>
                                ) : (
                                    openRouterModels.map((model) => (
                                        <option key={model.id} value={model.id}>
                                            {model.name} - {model.description}
                                        </option>
                                    ))
                                )
                            ) : (
                                modelProviders[selectedProvider as keyof typeof modelProviders]?.models.map((model) => (
                                    <option key={model.modelId} value={model.modelId}>
                                        {model.displayName}
                                    </option>
                                ))
                            )}
                            <option value="custom">Custom Model</option>
                        </select>
                    </div>
                )}
            </div>

            {(selectedProvider || isCustomModel) && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="displayName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                Display Name
                            </label>
                            <input
                                id="displayName"
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full p-2.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                                placeholder="e.g., My Custom GPT-4"
                            />
                        </div>

                        <div>
                            <label htmlFor="modelId" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                Model ID
                            </label>
                            <input
                                id="modelId"
                                type="text"
                                value={modelId}
                                onChange={(e) => setModelId(e.target.value)}
                                className="w-full p-2.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                                placeholder="e.g., gpt-4-turbo-preview"
                            />
                            {isCustomModel && (
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                    The actual model identifier used in API calls
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="baseUrl" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                Base URL
                            </label>
                            <input
                                id="baseUrl"
                                type="text"
                                value={baseUrl}
                                onChange={(e) => setBaseUrl(e.target.value)}
                                className="w-full p-2.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="apiKey" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                API Key
                            </label>
                            <input
                                id="apiKey"
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="w-full p-2.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={createModelMutation.isPending}
                            className="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 transition-colors"
                        >
                            {createModelMutation.isPending ? "Creating..." : "Create Model"}
                        </button>
                    </div>
                </div>
            )}
        </form>
    );
}

export default function ModelsPage() {
    const { data: models, isLoading, error } = api.models.listModels.useQuery();
    const utils = api.useUtils();

    const deleteModelMutation = api.models.deleteModel.useMutation({
        onSuccess: () => {
            toast.success("Model deleted successfully");
            utils.models.listModels.invalidate();
        },
        onError: (error) => {
            toast.error(`Error deleting model: ${error.message}`);
        },
    });

    if (isLoading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Model Manager</h1>

            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Add New Model</h2>
                <AddModelForm />
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-6">Existing Models</h2>
                <div className="overflow-x-auto bg-white dark:bg-neutral-800 rounded-lg shadow border border-neutral-200 dark:border-neutral-700">
                    <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                        <thead className="bg-neutral-50 dark:bg-neutral-900">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Display Name</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Model ID</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Base URL</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">API Key</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                            {models?.map((model) => (
                                <tr key={model.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">{model.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-neutral-600 dark:text-neutral-400">{model.modelId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">{model.baseUrl}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-mono text-sm text-neutral-600 dark:text-neutral-400">•••••••••••</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => deleteModelMutation.mutate({ id: model.id })}
                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm disabled:opacity-50"
                                            disabled={deleteModelMutation.isPending}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {models?.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                                        No models added yet. Add your first model above.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
} 