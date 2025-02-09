"use client";

import React, { FormEvent, ChangeEvent } from "react";
import { api } from "@/lib/trpc/react";
import { toast } from "react-toastify";

function AddModelForm() {
    const utils = api.useUtils();
    const createModelMutation = api.models.createModel.useMutation({
        onSuccess: () => {
            toast.success("Model created successfully");
            utils.models.listModels.invalidate();
            setName("");
            setBaseUrl("");
            setApiKey("");
        },
        onError: (error) => {
            toast.error(`Error creating model: ${error.message}`);
        },
    });

    const [name, setName] = React.useState("");
    const [baseUrl, setBaseUrl] = React.useState("");
    const [apiKey, setApiKey] = React.useState("");

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        await createModelMutation.mutateAsync({ name, baseUrl, apiKey });
    }

    function handleChange(e: ChangeEvent<HTMLInputElement>, setter: (value: string) => void) {
        setter(e.target.value);
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-8">
            <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Name
                </label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => handleChange(e, setName)}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>
            <div>
                <label htmlFor="baseUrl" className="block text-sm font-medium mb-1">
                    Base URL
                </label>
                <input
                    id="baseUrl"
                    type="text"
                    value={baseUrl}
                    onChange={(e) => handleChange(e, setBaseUrl)}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>
            <div>
                <label htmlFor="apiKey" className="block text-sm font-medium mb-1">
                    API Key
                </label>
                <input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => handleChange(e, setApiKey)}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>
            <button
                type="submit"
                disabled={createModelMutation.isPending}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
            >
                {createModelMutation.isPending ? "Creating..." : "Create Model"}
            </button>
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
        return <div className="p-4">Loading...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error.message}</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Model Manager</h1>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Add New Model</h2>
                <AddModelForm />
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">Existing Models</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border rounded-lg">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base URL</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API Key</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {models?.map((model) => (
                                <tr key={model.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{model.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{model.baseUrl}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-mono">•••••••••••</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => deleteModelMutation.mutate({ id: model.id })}
                                            className="text-red-600 hover:text-red-800"
                                            disabled={deleteModelMutation.isPending}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
} 