import React from "react";
import ClientProvider from "@/components/ClientProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function getSession() {
  try {
    const session = await getServerSession(authOptions);
    return session;
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
}

export default function HomePage() {
  return (
    <div className="py-12">
      <h1 className="text-4xl font-bold text-center mb-8">
        Welcome to LLM Eval Tool
      </h1>
      <p className="text-xl text-center text-gray-600 max-w-2xl mx-auto">
        A powerful tool for generating, running, and judging evaluations of Large Language Models.
      </p>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Generate Evals</h2>
          <p className="text-gray-600">
            Create evaluation prompts and test cases for your models.
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Run Evals</h2>
          <p className="text-gray-600">
            Execute evaluations across multiple models simultaneously.
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Judge Evals</h2>
          <p className="text-gray-600">
            Rate and compare model responses to determine performance.
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>
          <p className="text-gray-600">
            View statistics and rankings of model performance.
          </p>
        </div>
      </div>
    </div>
  );
}
