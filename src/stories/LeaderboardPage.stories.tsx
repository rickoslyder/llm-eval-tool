import type { Meta, StoryObj } from "@storybook/react";
import LeaderboardPage from "../app/dashboard/leaderboard/page";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const meta: Meta<typeof LeaderboardPage> = {
    title: "Dashboard/Leaderboard/LeaderboardPage",
    component: LeaderboardPage,
    decorators: [
        (Story) => {
            const queryClient = new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: false,
                    },
                },
            });

            // Add mock data for the leaderboard
            queryClient.setQueryData(['judgments.getLeaderboard'], [
                { modelId: '1', modelName: 'GPT-4', averageScore: 0.95, totalJudgments: 100 },
                { modelId: '2', modelName: 'Claude', averageScore: 0.92, totalJudgments: 80 },
                { modelId: '3', modelName: 'PaLM', averageScore: 0.88, totalJudgments: 75 },
            ]);

            // Add mock data for model stats
            queryClient.setQueryData(['models.listModels'], [
                { id: '1', name: 'GPT-4' },
                { id: '2', name: 'Claude' },
                { id: '3', name: 'PaLM' },
            ]);

            queryClient.setQueryData(['results.listResults'], [
                { modelId: '1', errorLog: null },
                { modelId: '1', errorLog: null },
                { modelId: '2', errorLog: 'Error' },
                { modelId: '3', errorLog: null },
            ]);

            return (
                <QueryClientProvider client={queryClient}>
                    <Story />
                    <ToastContainer />
                </QueryClientProvider>
            );
        },
    ],
};

export default meta;
type Story = StoryObj<typeof LeaderboardPage>;

export const Default: Story = {}; 