import type { Meta, StoryObj } from "@storybook/react";
import JudgeModePage from "../app/dashboard/judge-mode/page";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const meta: Meta<typeof JudgeModePage> = {
    title: "Dashboard/JudgeMode/JudgeModePage",
    component: JudgeModePage,
    decorators: [
        (Story) => {
            const queryClient = new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: false,
                    },
                },
            });
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
type Story = StoryObj<typeof JudgeModePage>;

export const Default: Story = {}; 