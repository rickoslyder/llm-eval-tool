import type { Meta, StoryObj } from "@storybook/react";
import RunEvalsPage from "../app/dashboard/run-evals/page";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const meta: Meta<typeof RunEvalsPage> = {
    title: "Dashboard/RunEvals/RunEvalsPage",
    component: RunEvalsPage,
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
type Story = StoryObj<typeof RunEvalsPage>;

export const Default: Story = {}; 