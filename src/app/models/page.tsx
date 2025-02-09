"use client";

import React from "react";
import { api } from "@/lib/trpc/react";
import { Button } from "@/components/ui/button";

type Model = {
    id: string;
    name: string;
    baseUrl: string;
    apiKey: string;
    createdAt: Date;
};

export default function ModelsPage() {
    const { data: models, refetch } = api.model.listModels.useQuery();
    const createModelMutation = api.model.createModel.useMutation({
        onSuccess: () => refetch(),
    });

    async function handleCreateModel() {
        await createModelMutation.mutateAsync({
            name: "My LLM",
            baseUrl: "https://api.example.com",
            apiKey: "fake-key",
        });
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Models</h1>
            <Button onClick={handleCreateModel}>Add Model</Button>
            <ul className="mt-4 space-y-2">
                {models?.map((m: Model) => (
                    <li key={m.id} className="p-4 border rounded-lg shadow-sm">
                        <div className="font-medium">{m.name}</div>
                        <div className="text-sm text-gray-600">{m.baseUrl}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
} 